//IndexedDB functions
const dbFunc = (function(){
  'use strict';

  //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  const dbPromise = idb.open('restaurants-v2', 1, function(upgradeDb) {
    console.log(`Working on adding information`);
    switch(upgradeDb.oldVersion){
      case 0:
         upgradeDb.createObjectStore('restaurants', {keyPath: "id"});
         addData();
    //   case 1:
    //     const updateReviews = upgradeDb.createObjectStore("reviews", {keyPath: "id"});
    //     updateReviews.createIndex("restaurant_id", "restaurant_id");
    //     saveReview();
      }
  });


  //Add Data to IDB Index
  function addData(){
    fetch(DBHelper.DATABASE_URL)
    .then(function (response) {
      return response.json();
      })
    .then (function(restaurants){
      dbPromise.then(function (db) {
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        restaurants.forEach(function (restaurant) {
          store.put(restaurant)  
        });
      });
      callback(null, restaurants);
      })
    .catch(function (err) {
        const error = (`${err}: Issue storing Data.`);
      });   
  };

  // function saveReview(){
  //   fetch(DATABASE_REVIEWS)
  //   .then(response => response.json())
  //   .then(review => {
  //     dbPromise.then(function (db) {
  //       var tx = db.transaction('reviews', 'readwrite');
  //       var store = tx.objectStore('reviews');
  //       return Promise.all(review.map(function(rev) {
  //         return store.add(rev);
  //       }))
  //       .catch(function(e){
  //         tx.abort();
  //         console.log(`Error adding reviews: ${e}`)
  //       }).then(console.log(`New review added.`))
  //     })
  //   })
  //}


  //Retrieve data from IDB index
  function getData() {
    return dbPromise.then(function(db){
      var tx = db.transaction('restaurants', 'readonly');
      var store = tx.objectStore('restaurants');
      return store.getAll();
    });
  }

  return {
    dbPromise: (dbPromise),
    addData: (addData),
    getData: (getData)
  };
})();


  //Function to retrieve the data for each restaurant from the DB
  


/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Changed this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return `http://localhost:1337/restaurants`;
  }

  static get DATABASE_REVIEWS() {
    return `http://localhost:1337/reviews/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    
    //Check DB for information and then fetch data from server
    dbFunc.getData().then(function(restaurants){
      return restaurants;
    });


    fetch(`${DBHelper.DATABASE_URL}`)
        .then(response => response.json())
        .then(data => callback(null, data))
        .catch(error => callback(`Returned Error status of ${error}`));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }


  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    //console.log(restaurant.id);
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph){
      return (`/img/${restaurant.photograph}.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 

  //Fetch Reviews by restaurant ID
  static fetchReviews(id, callback) {
    const fetchURL = `${DBHelper.DATABASE_REVIEWS}?restaurant_id=${id}`;
    fetch(fetchURL, {method: "GET"})
    .then(response => {
      if (!response.clone().ok && !response.clone().redirected) {
        throw "No reviews available";
    } response.json()
    .then(review => {
      //console.log(review);
      callback(null, review)
    }
    )})
    .catch(error => callback(error, null));
  }


  // static updateFav(id, status, callback){
  //   const url = ``
  // }
  

}

