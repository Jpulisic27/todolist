//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const _ = require("lodash");
const PORT = process.env.PORT || 1995;



const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Define a schema for your data
const itemsSchema = mongoose.Schema({
    name: { type: String, required: true}
  });

  // Create a model based on the schema
const Item = mongoose.model('Item', itemsSchema);

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://Admin-julcoded:test1234@cluster0.na1ness.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//items of database
const item1 = new Item ({
    name: "Welcome to your todolist."
});

const item2 = new Item ({
    name: "Hit the + button to add a new item."
});

const item3 = new Item ({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
  name: {type: String, required: true},
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req,res) {

  Item.find({}).exec()
  .then(foundItems => {
    if (foundItems.length === 0) {
              //  Insert the array of items into the database
Item.insertMany(defaultItems)
.then(() => {
  console.log('Successfully saved default items to DB');
  // Do something else after inserting
})
.catch((error) => {
  console.error('Error inserting users:', error);
});
res.redirect("/");
    } else{
          res.render("list", {
        ListTitle: "Today", newListItems: foundItems});
    }
  })
  .catch(error => {
    console.error(error);
  });
});

app.get("/:customListName", function(req,res) {
 const customListName = _.capitalize(req.params.customListName);

 List.findOne({ name: customListName })
  .then(foundList => { 
    if (!foundList) {
      //create a new list
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      
      list.save();
      res.redirect("/" + customListName);
      
    } else {
      //show an existing list
     res.render("list", {
      ListTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(error => {
    console.error(error);
    // Handle the error
  });

});

app.post("/", function(req,res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item ({
      name: itemName
    });

    if (listName === "Today"){
          //saving
item.save();
res.redirect("/");
    } else {
    List.findOne({ name: listName})
      .then(foundList => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
      })
      .catch(error => {
        console.error(error);
      });
    }
  
});

app.post("/delete", function(req,res) {
 const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

 if (listName === "Today") {

  
 Item.findOneAndDelete({ _id: checkedItemId }).exec()
 .then(result => {
   console.log('Document removed:', result);
   res.redirect("/");
 })
 .catch(error => {
   console.error(error);
 });
 } else {

  List.findOneAndUpdate(
    { name: listName},
    { $pull: {items: {_id: checkedItemId}}},
    {new: true}
  )
    .then((foundList) => {
      if (foundList) {
        res.redirect("/" + listName);
      } 
    })
    .catch((error) => {
      console.error(error);
    });
 }

});


app.get("/about", function(req, res){
    res.render("about");
});

// // Use PORT provided in environment or default to 1995
// const port = process.env.PORT || 1995;

// // Listen on `port` and 0.0.0.0
// app.listen(port, "0.0.0.0", function () {
//   // ...
// });

app.listen(PORT, () => {
    console.log("server started on port ${PORT}");
});

