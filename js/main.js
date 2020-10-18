let moviesController = {
  init : function(){
    this.functions.loadMoviesToStorage();
    this.functions.displayMovieToHistory();
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
    removeMovieToStorage: function(key){ // removing from history and storage
      let movies = JSON.parse(localStorage.getItem("movies"));
      for (let i in movies){
        if(movies[i].id == key){          
          movies.splice(i, 1);
        }        
      }
      this.saveMoviesToStorage(movies);
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
          <button type="button" class="close" aria-label="Close" key="${id}">
            <span aria-hidden="true">&times;</span>
          </button>
         </div>`;
        }
      }
      $(".searchHistory").html(output);      
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
    }
  }
}

moviesController.init();

$(document).ready(function () {

  $("#searchButton").on("click", function (e) {        
    const name = $("#searchText").val(); // getting value from input
    if(name == ""){ // input null control
      moviesController.functions.showAlert("danger", "Please enter a movie");
    }else{
      if(name.length >= 3){ // controlling input value length 
        moviesController.functions.addMovieToStorage(name);        
        $("#searchText").val("");
      }else{
        moviesController.functions.showAlert("danger", "The search word must be longer than 3 characters");
      }
    }
    e.preventDefault();
    moviesController.functions.displayMovieToHistory(); // showing all search on history html
  });
  

});
