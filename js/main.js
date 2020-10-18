let moviesController = {
  init : function(){
    this.functions.loadMoviesToStorage();
    this.functions.loadFavoritesToStorage();
    this.functions.displayMovieToHistory();
    this.functions.displayFavoritesList();
  },
  functions: {
    saveMoviesToStorage: function(movies){ // saving search text to storage
      localStorage.setItem("movies", JSON.stringify(movies))
    },
    loadMoviesToStorage: function(){ // loading search text from the localstorage
      let movies = JSON.parse(localStorage.getItem("movies")) || [];
      return movies;
    },
    addMovieToStorage: function(name){ // adding new search text to storage
      let movies = JSON.parse(localStorage.getItem("movies")) || [];
      let id;
      if(movies.length > 0){
        id = 1;
        id += movies[movies.length - 1].id
      }else{
        id = 1
      }        
      let item = {
        name,
        id
      }
      movies.push(item);
      this.saveMoviesToStorage(movies);
    },
    removeMovieToStorage: function(key){ // removing from storage
      let movies = JSON.parse(localStorage.getItem("movies"));
      for (let i in movies){
        if(movies[i].id == key){          
          movies.splice(i, 1);
        }        
      }
      this.saveMoviesToStorage(movies);
    },
    removeMovieToHistory : function(){ // removing from history html
      let key = $(this).attr("key");    
      moviesController.functions.removeMovieToStorage(key);
      moviesController.functions.displayMovieToHistory();
      moviesController.functions.showAlert("success", "The search word removed from history.");
    },
    listMovies: function(){ // array of search list
      let movieCopy = [];
      let movies = JSON.parse(localStorage.getItem("movies"));
      for(let i in movies){
        let item = movies[i];
        let itemCopy = {};
        for(let p in item){
          itemCopy[p] = item[p];
        }
        movieCopy.push(itemCopy);
      }
      return movieCopy;
    },
    displayMovieToHistory: function(){ // displaying search text on html
      let moviesArray = this.listMovies();
      let newMoviesArray = moviesArray.slice(-10);
      let output = "";
      if(!moviesArray.length <= 0){
        for(let i in newMoviesArray){
          let movie = newMoviesArray[i];
          let name = movie.name;
          let id = movie.id;
          output += `<div class="shItem bg-primary">
          <span class="shText text-white">${name}</span>
          <button type="button" class="close remove" aria-label="Close" key="${id}">
            <span aria-hidden="true">&times;</span>
          </button>
         </div>`;
        }
      }
      $(".searchHistory").html(output);
      let btn = document.getElementsByClassName('remove');
      for(let i = 0; i < btn.length; i++){
        btn[i].addEventListener("click", this.removeMovieToHistory);
      }  
    },
    showAlert: function(type, message){ // creating custom alert
      let searchHistoryBody = $(".alertContainer");
      let alert = "";
      alert += `<div class="alert alert-${type} alert-dismissible fade show">                  
                  ${message}
                </div>
                `;
      $(".alert").text(message);
      searchHistoryBody.html(alert);
      window.setTimeout(function() {
        $(".alert").hide(); 
      }, 2500);
    },
    inActiveButton: function(){
      $("#searchButton").addClass("disabled");      
    },
    activeButton: function(){
      $("#searchButton").removeClass("disabled");      
    },
    getMoviesOnApi : function(name){ // getting movies from api
      if(name){
        $.getJSON(`https://www.omdbapi.com/?s=${name}&type=movie&apikey=62f90678`, function(data){
          if(data.Search !== undefined){ 
            moviesController.functions.displayMovieList(data.Search);
          }else{
            moviesController.functions.showAlert("warning", "Movie not found containing the word you searched for.");
          }
        });
      }else{
        $(".movies .row").html("");
      }      
    },
    displayMovieList: function(data){ // displaying movie list on html            
      let output = "";
      if(!data.length <= 0){
        for( let i in data ){
          let movie = data[i];
          let title = movie.Title,
              image = movie.Poster !== undefined && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x445' ,
              year = movie.Year !== undefined && movie.Year !== 'N/A' ? movie.Year : '-';
          output += `<div class="col col-12 col-sm-2 col-md-3 cardContent">
          <div class="card" style="width: 100%;">
            <img src="${image}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">
                <b>Year : </b> <span class="card-text-span">${year}</span>
              </p>
              <button class="btn btnFav" movieTitle="${title}">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
              </svg>           
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>              
              </button>
            </div>
          </div>
        </div>`;      
        }
      }
      $(".movies .row").html(output);
      let btn = document.getElementsByClassName('btnFav');
      for(let i = 0; i < btn.length; i++){
        btn[i].addEventListener("click", this.toggleFav);
      }                    
    },    
    toggleFav: function(){ // toggle favorites button action      
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];            
      let movieTitle = $(this).parent().parent().find(".card-title").html(),
          movieYear = $(this).parent().parent().find(".card-text-span").html(),
          movieImg = $(this).parent().parent().find(".card-img-top").attr("src");          
      if(favorites.length > 0){
        for (let i in favorites){
          if(favorites[i].name == movieTitle){
            $(this).removeClass("added");
            moviesController.functions.removeMovieToFavorites(movieTitle);          
            moviesController.functions.displayFavoritesList();
            moviesController.functions.showAlert("success", "Movie is successfully removed on favorites list.");
          }else{
            $(this).addClass("added");
            moviesController.functions.addFavoritesToStorage(movieTitle, movieYear, movieImg);            
            moviesController.functions.displayFavoritesList();
            moviesController.functions.showAlert("success", "Movie is successfully added on favorites list.");
          }
        }
      }else{
        $(this).addClass("added");
        moviesController.functions.addFavoritesToStorage(movieTitle, movieYear, movieImg);
        moviesController.functions.displayFavoritesList();
        moviesController.functions.showAlert("success", "Movie is successfully added on favorites list.");
      }            
    },    
    saveFavoritesToStorage: function(favorites){ // saving favorites to storage
      localStorage.setItem("favorites", JSON.stringify(favorites))
    },
    loadFavoritesToStorage: function(){ // loading favorites from the storage
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      return favorites;
    },
    listFavorites: function(){  // array of favorites list
      let favCopy = [];
      let favorites = JSON.parse(localStorage.getItem("favorites"));
      for(let i in favorites){
        let item = favorites[i];
        let itemCopy = {};
        for(let p in item){
          itemCopy[p] = item[p];
        }
        favCopy.push(itemCopy);
      }
      return favCopy;
    },
    addFavoritesToStorage: function(name, year, poster){ // adding favorites to storage 
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];            
      let id;
      if(favorites.length > 0){
        id = 1;
        id += favorites[favorites.length - 1].id
      }else{
        id = 1
      }        
      let item = {
        name,
        year,
        poster,
        id
      } 
      let control = true;
      for(let i in favorites){
        if(favorites[i].name === name){
          control = false;
        }
      }
      if(control){
        favorites.push(item);
        this.saveFavoritesToStorage(favorites);             
      }
    },
    removeMovieToFavorites: function(name){ // removing movie to favorites storage
      let favorites = JSON.parse(localStorage.getItem("favorites"));
      for (let i in favorites){
        if(favorites[i].name == name){          
          favorites.splice(i, 1);
        }        
      }
      this.saveFavoritesToStorage(favorites);
    },
    displayFavoritesList: function(){ // displaying favorites movie to html
      let favoritesArray = this.listFavorites();
      let output = "";
      if(!favoritesArray.length <= 0){
        for(let i in favoritesArray){
          let movie = favoritesArray[i];
          let title = movie.name,
              image = movie.poster,
              year = movie.year,
              id = movie.id;
          output += `<div class="col col-12 col-sm-2 col-md-3 cardContent">
          <div class="card" style="width: 100%;">
            <img src="${image}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${title}</h5>
              <p class="card-text">
                <b>Year : </b> ${year}
              </p>
              <button class="btn btnFav added" key="${id}">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
              </svg>           
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>              
              </button>
            </div>
          </div>
        </div>`;
        }
      }else{
        output = `
        <div class="col col-12 col-sm-2 col-md-3 cardContent">
          <p>Favorites is empty!</p>
        </div>
        `;
      }          
      $(".favorites .row").html(output);      
      let btn = document.getElementsByClassName('btnFav');
      for(let i = 0; i < btn.length; i++){
        btn[i].addEventListener("click", this.toggleFav);
      }
    }          
  }
}


$(document).ready(function () {  
  moviesController.init();  
  $("#searchButton").click(function (e) {
    let name = $("#searchText").val(); // getting value from input
    moviesController.functions.listMovies();         
    if(name == ""){ // input null control
      moviesController.functions.showAlert("danger", "Please enter a movie");
    }else{
      if(name.length >= 3){ // controlling input value length 
        moviesController.functions.addMovieToStorage(name);
        moviesController.functions.getMoviesOnApi(name);          
        $("#searchText").val("");
      }else{
        moviesController.functions.showAlert("danger", "The search word must be longer than 3 characters");
      }
    }
    e.preventDefault();    
    moviesController.functions.displayMovieToHistory(); // showing all search on history html
  });

  $("#searchText").keydown(function() {
    let name = $("#searchText").val(); // getting value from input
    if(name.length >= 3 ){
      moviesController.functions.activeButton();
      moviesController.functions.getMoviesOnApi(name);
    }else{      
      moviesController.functions.inActiveButton();
      $(".movies .row").html("")
    }
  });

  $(".shItem").on("click", function(){ // search history buttons click action
    let text = $(this).find(".shText").html();
    $(".movies .row").html("");
    moviesController.functions.getMoviesOnApi(text);
  }); 
  

});
