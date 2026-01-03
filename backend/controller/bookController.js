const Book = require("../model/Book");

//Crete new book

const createBook = async (req, res) => {
  try {
    const { title, author, subtitle, chapters } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: "Title and Author are required" });
    }
    const book = await Book.create({
      userId: req.user._id,
      title,
      author,
      subtitle,
      chapters,
    });
    res.status(201).json(book);
  } catch (error) {
    console.log("Error creating book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(books);
  } catch (error) {
    console.log("Error fetching books:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.log("Error fetching book by ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedBook);
  } catch (error) {
    console.log("Error updating book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const updateBookCover = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (req.file) {
      book.coverImage = `/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const updatedBook = await book.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    console.log("Error deleting book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookCover,
};
