const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
        // Add the new user to the users array
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
}
// Return error if username or password is missing
return res.status(404).json({message: "Unable to register user."});

});

async function getBooks()
{
  return books
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {

  try
  {
      const allBooks = await getBooks();
      return res.status(300).json(allBooks);
  }
  catch(error)
  {
    return res.status(500).json({ message: "An error occurred while fetching books." });
  }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  const getbookbyISBN = new Promise((resolve,reject)=>{
    const book = books[isbn];
    if(book)
    {
      resolve(book);
    }
    else
    {
      reject("book Not found");
    }
  });
  getbookbyISBN
    .then((book)=>{
      res.status(200).json(book);
    })
    .catch((error)=>{
      return res.status(500).json({ message: error });
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author=req.params.author
  try{
  const authBooks = await new Promise((resolve) => {
    const Booksbyauthor = Object.keys(books)
    .filter(isbn => books[isbn].author === author)
    .map(isbn => ({
      isbn: isbn,
      title: books[isbn].title,
      review: books[isbn].reviews
    }));
    resolve(Booksbyauthor);
  });

  let author_books={
    "booksbyAuthor":authBooks
  }
  return res.status(300).json(author_books);
  }
  catch (error)
  {
    return res.status(500).json({ message: "An error occurred while fetching books by author." });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title=req.params.title
  const Bookswithtitle = Object.keys(books)
  .filter(isbn => books[isbn].title === title)
  .map(isbn => ({
    isbn: isbn,
    author: books[isbn].author,
    review: books[isbn].reviews
  }));
  let foundbook={
    "booksbyTitle":Bookswithtitle
  }
  return res.status(300).json(foundbook);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  review=books[isbn].reviews
  return res.status(300).json(review);
});

module.exports.general = public_users;
