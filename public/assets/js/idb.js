// create variable to hold db connection
let db;

// establish connection to indexeddb db called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the db version changes
request.onupgradeneeded = function(event) {
    //save a reference to the db
    const db = event.target.result;
    // create an object store (table) called 'new_pizza', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// on success
request.onsuccess = function(event) {
    //when db successfully created with its object store from onupgradeneeded event above, or simply established connection, save ref to db in global variable
    db = event.target.result;
    //check if app online, if yes run uploadPizza() function to send all local db data to api
    if(navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// this function will be executed if we attempt to submit a new pizza and theres no internet
function saveRecord(record) {
    //open new transaction with the db with read and write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access the object store for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to your store
    pizzaObjectStore.add(record);
};

function uploadPizza() {
    // open transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');
    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');
    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();
    // upon successfull .getall execution, run this
    getAll.onsuccess = function() {
        // if data in indexeddb store, send to api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error (serverResponse);
                }
                //open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                //access the new_pizza object store
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                //clear all items in your store
                pizzaObjectStore.clear();

                alert('All saved pizza has been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadPizza);