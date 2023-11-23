
const express = require("express");
const bodyParser  = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://SaiKumar:mongodb55@cluster0.uu5h1xg.mongodb.net/todolistDB");

const itemSchema = mongoose.Schema({
    name:String
});
const listSchema = mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);
const defaultItems = [{
    name:"Do Something"
}];

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine",'ejs');

app.get("/",(req,res)=>{
    Item.find({})
    .then((foundItems)=>{
        if (foundItems.length == 0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        }else{
            res.render("list",{listTitle:"Today",itemsList:foundItems});
        }
    })
   
});
app.post("/",(req,res)=>{
    const newItem = req.body.inputItem;
    const listName = req.body.list;
    const item = new Item({
        name:newItem
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName})
        .then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
   
});

app.post("/delete",(req,res)=>{
    const delId = req.body.cBox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(delId)
    .then(()=>{
        res.redirect("/");
    });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:delId}}})
        .then(()=>{
            res.redirect("/"+listName);
        })
    }
    
    
});

app.get("/:customRoute",(req,res)=>{
    const customRoute = _.capitalize(req.params.customRoute);

    List.findOne({name:customRoute})
    .then((foundList)=>{
        if(!foundList){
            const list = new List({
                name:customRoute,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customRoute);
        }else{
            res.render("list",{listTitle:foundList.name,itemsList:foundList.items});
        }
    })

});

app.listen(3000,()=>{
    console.log("server is running at 3000");
});


// let date = new Date();
    
// let options = {
//     weekday : "long",day:"numeric",month:"short",year:"numeric"
// };

// let today = date.toLocaleDateString("en-US",options);