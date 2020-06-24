// CRUD createe read update and delete
const {MongoClient, ObjectID } = require('mongodb')

//Give Access to the function necessary to connect to the database so we can perform our basic CRUD operations

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

const id = ObjectID()
console.log(id);
console.log(id.getTimestamp());


//Establish connection
MongoClient.connect(connectionURL, { useNewUrlParser: true,useUnifiedTopology: true }, (error,client) => {
    //The Callback function will be called when the database connects
    /*
        Connecting to the database is not a synchronous operation it is a asynchronous Operation
        It takes a bit of a time to setup the operation. It gets called as soon as the connection is successfull
        ERROR: if not connected
        CLIENT: Connection successfull
    */
    if (error) {
        return console.log(error);
    }
    //Create a DB
    const db = client.db(databaseName)

    db.collection('users').deleteMany({
        age:'23'
    }).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);        
    })

})
