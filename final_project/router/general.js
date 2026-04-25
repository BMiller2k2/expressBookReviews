import express from 'express';
import axios from 'axios';
import booksData from './booksdb.js';
import { isValid, users } from './auth_users.js';
const public_users = express.Router();

// 1. Fixed Imports: Dynamic imports return a promise, so we must await them
let books = booksData;

// Initializing data from local files
const initializeData = async () => {
    try {
        const booksModule = await import("./booksdb.js");
        // Log this to see what the file actually contains
        console.log("Loaded Module:", booksModule);

        books = booksModule.default;
    } catch (err) {
        console.error("Failed to load local modules:", err.message);
    }
};


// 2. Updated Routes to use Async/Await
public_users.get("/", async (req, res) => {
    // Check if books data has loaded yet
    res.status(200).json(books);;
});

public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        if (books[isbn]) {
            res.status(200).send(books[isbn].reviews);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving reviews" });
    }
});

public_users.get("/isbn/:isbn", async (req, res) => {
    const isbn = req.params.isbn;

    // Check if books data has loaded yet
    if (!books || Object.keys(books).length === 0) {
        return res.status(503).json({ message: "Database still loading, please try again." });
    }

    const book = books[isbn];
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const allBooks = Object.values(books);
    // Edge Case: Handling case-insensitivity and multiple books by same author
    const filteredBooks = allBooks.filter(b => b.author.toLowerCase() === author);

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author" });
  }
});

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const allBooks = Object.values(books);
    const filteredBooks = allBooks.filter(b => b.title.toLowerCase().includes(title));

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Book title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book by title" });
  }
});

const getBooks = async () => {
    try {
        const response = await axios.get("http://127.0.0:5000/");
        console.log("All Books:", JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error fetching books:", error.message);
    }
};

const getBookByISBN = async (isbn) => {
    try {
        // We use backticks ( ` ) and ${isbn} to insert the number
        const response = await axios.get(`http://127.0.0.1:5000/isbn/1`);
        console.log(`Book details for ISBN ${isbn}:`, JSON.stringify(response.data, null, 4));
    } catch (error) {
        // This will tell us if the URL is still malformed or if the ID was not found
        console.error(`Error fetching ISBN ${isbn}:`, error.message);
    }
};

const getBooksByAuthor = async (author) => {
    try {
        // This matches the path: http://localhost:5000/author/Chinua%20Achebe
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Books by ${author}:`);
        console.log(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
    }
};
const getBooksByTitle = async (title) => {
    try {
        // This matches the path: http://localhost:5000/title/Things%20Fall%20Apart
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`Books with title "${title}":`);
        console.log(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error(`Error fetching books by title ${title}:`, error.message);
    }
};


// Fixed calling syntax (removed incorrect setTimeout syntax)
getBooks()
getBookByISBN(1)
getBooksByAuthor("Chinua Achebe");
getBooksByTitle("Things Fall Apart")
export const general = public_users;
