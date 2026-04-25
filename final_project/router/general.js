const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
const axios = require('axios');

const getBooks = async () => {
    try {
        const response = await axios.get("http://localhost:5000/");
        console.log(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error fetching books:", error.message);
    }
};
getBooks();

const getBookByISBN = async (isbn) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log("Book details by ISBN:");
        console.log(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error fetching ISBN:", error.message);
    }
};

// Test it
getBookByISBN(1)

const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Books by ${author}:`);
        console.log(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error fetching author:", error.message);
    }
};

// Test it
getBooksByAuthor("Chinua Achebe");

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let filtered_books = Object.values(books).filter(book => book.title === title);
    res.send(filtered_books);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
