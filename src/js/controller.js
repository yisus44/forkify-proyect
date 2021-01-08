import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./view/recipeView.js";
import searchView from "./view/searchView.js";
import resultsView from "./view/resultsView.js";
import paginationView from "./view/paginationView.js";
import bookmarksView from "./view/bookmarksView.js";
import addRecipeView from "./view/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";
import { async } from "regenerator-runtime";

async function controlRecipes() {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 1.- Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 2.- Update bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 3.- Load recipe
    await model.loadRecipe(id);

    // 4.- Render recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
}
async function controlSearchResults() {
  try {
    resultsView.renderSpinner();

    // 1.- Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2.- Load search results
    await model.loadSearchResults(query);

    // 3.- Render results
    resultsView.render(model.getSearchResultsPage());

    // 4.- Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
}

function controlPagination(goToPage) {
  // 1.- Display new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2.- Display new paginations buttons
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  // Update servings data
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  // 1.- Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2.- Update recipe view
  recipeView.update(model.state.recipe);

  // 3.- Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

async function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    // Display the spinner
    addRecipeView.renderSpinner();

    // Upload new recipe (data)
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe in the DOM
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in the URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
