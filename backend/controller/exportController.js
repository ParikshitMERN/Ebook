const {
  Document,
  Packer,
  Paragraph,
  TecxtRun,
  HeadningLevel,
  AlignmentType,
  UnderlineType,
  ImageRun,
} = require("docx");
const PDFDocument = require("pdfkit");
const MarkdownIt = require("markdown-it");
const Book = require("../models/Book");
const path = require("path");
const fs = require("fs");
const { size } = require("pdfkit/js/page");

const md = new MarkdownIt();

const DOCX_STYLES = {
  fonts: {
    body: "Charter",
    headin: "Poppins",
  },
  sizes: {
    title: 32,
    subtitle: 20,
    author: 18,
    chapterTitle: 24,
    h1: 20,
    h2: 18,
    h3: 16,
    body: 12,
  },
  spacing: {
    paragtaphBefore: 200,
    paragraphAfter: 200,
    chapterBefore: 400,
    chapterAfter: 300,
    headingBefore: 300,
    headingAfter: 150,
  },
};

const processMarkdownToDocx = (markdown) => {
  const tokens = md.parse(markdown, {});
  const paragraphs = [];
  let inList = false;
  let listType = null;
  let orderedCounter = 1;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    try {
      if (token.type === "heading_open") {
        const level = parseInt(token.tag.substring(1));
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "inline") {
          let headingLevel;
          let fontSize;
          switch (level) {
            case 1:
              headingLevel = HeadingLevel.HEADING_1;
              fontSize = DOCX_STYLES.sizes.h1;
              break;
            case 2:
              headingLevel = HeadingLevel.HEADING_2;
              fontSize = DOCX_STYLES.sizes.h2;
              break;
            case 3:
              headingLevel = HeadingLevel.HEADING_3;
              fontSize = DOCX_STYLES.sizes.h3;
              break;
            default:
              headingLevel = HeadingLevel.HEADING_3;
              fontSize = DOCX_STYLES.sizes.h3;
          }
          paragraphs.push(
            new Paragraph({
              text: nextToken.content,
              heading: headingLevel,
              spacing: {
                before: DOCX_STYLES.spacing.headingBefore,
                after: DOCX_STYLES.spacing.headingAfter,
              },
              style: {
                font: DOCX_STYLES.fonts.heading,
                size: fontSize * 2,
              },
            })
          );
          i += 2;
        }
      } else if (token.type === "paragraph_open") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "inline" && nextToken.children) {
          const textRuns = processInlineTokensToTextRuns(nextToken.children);
          if (textRuns.Length > 0) {
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                spacing: {
                  before: inList ? 100 : DOCX_STYLES.spacing.paragtaphBefore,
                  after: inList ? 100 : DOCX_STYLES.spacing.paragraphAfter,
                  line: 360,
                },
                alignment: AlignmentType.JUSTIFIED,
              })
            );
          }
          i += 2;
        }
      } else if (token.type === "bullet_list_open") {
        inList = true;
        listType = "bullet";
      } else if (token.type === "bullet_list_close") {
        inList = false;
        listType = null;
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } })); // Add space before ordered list
      } else if (token.type === "ordered_list_open") {
        inList = true;
        listType = "ordered";
        orderedCounter = 1;
      } else if (token.type === "ordered_list_close") {
        inList = false;
        listType = null;
        orderedCounter = 1;
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } })); // Add space after ordered list
      } else if (token.type === "list_item_open") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "paragraph_open") {
          const inlineToken = tokens[i + 2];
          if (
            inlineToken &&
            inlineToken.type === "inline" &&
            inlineToken.children
          ) {
            const textRuns = processInlineContent(inlineToken.children);
            let bulletText = "";
            if (listType === "bullet") {
              bulletText = "•";
            } else if (listType === "ordered") {
              bulletText = `${orderedCounter}.`;
              orderedCounter++;
            }
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: bulletText,
                    font: DOCX_STYLES.fonts.body,
                  }),
                  ...textRuns,
                ],
                spacing: {
                  before: { before: 50, after: 50 },
                  indent: { left: 720 },
                },
              })
            );
            i += 4;
          }
        }
      } else if (token.type === "blackquote_open") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "paragraph_open") {
          const inlineToken = tokens[i + 2];
          if (inlineToken && inlineToken.type === "inline") {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: inlineToken.content,
                    italics: true,
                    color: "6B7280",
                    font: DOCX_STYLES.fonts.body,
                  }),
                ],
                spacing: {
                  before: { before: 200, after: 200 },
                  indent: { left: 720 },
                  alignment: AlignmentType.JUSTIFIED,
                  border: {
                    left: {
                      color: "D1D5DB",
                      space: 1,
                      style: "single",
                      size: 24,
                    },
                  },
                },
              })
            );
            i += 4;
          }
        }
      } else if (token.type === "code_block" || token.type === "fence") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: token.content,
                font: "Courier New",
                sizes: 20,
                color: "374151",
              }),
            ],
            spacing: {
              before: { before: 200, after: 200 },
              shading: {
                fill: "D1D5DB",
              },
            },
          })
        );
      }
    } catch (error) {
      console.error("Error processing markdown token:", error);
    }
  }
};
const exportAsDocument = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const sections = [];
    const coverPage = [];
    if (book.coverImage && !book.coverImage.includes("pravatar")) {
      const imagePath = book.coverImage.substring(1);
      try {
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);

          coverPage.push(
            new Paragraph({
              text: "",
              spacing: { before: 1000 },
            })
          );
          coverPage.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 400,
                    height: 550,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 400 },
            })
          );
          coverPage.push(
            new Paragraph({
              text: "",
              pageBreakBefore: true,
            })
          );
        }
      } catch (error) {
        console.error("Error loading cover image:", error);
        res.status(500).json({ message: "Error loading cover image" });
      }
    }
    sections.push({ ...coverPage });

    const titlePage = [];

    titlePage.push(
      new Paragraph({
        children: [
          new TextRun({
            text: book.title,
            bold: true,
            font: DOCX_STYLES.fonts.heading,
            size: DOCX_STYLES.sizes.title * 2,
            color: "1A202C",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 400 },
      })
    );

    if (book.subtitle && book.subtitle.trim()) {
      titlePage.push(
        new Paragraph({
          children: [
            new TextRun({
              text: book.title,
              font: DOCX_STYLES.fonts.heading,
              size: DOCX_STYLES.sizes.title * 2,
              color: "4A5568",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }
    titlePage.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `by ${book.author}`,
            font: DOCX_STYLES.fonts.heading,
            size: DOCX_STYLES.sizes.title * 2,
            color: "2D3748",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    titlePage.push(
      new Paragraph({
        text: "",
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: "single",
            size: 12,
          },
        },

        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
      })
    );

    sections.push({ ...titlePage });

    book.chapters.forEach((chapters, index) => {
      try {
        if (index > 0) {
          sections.push(
            new Paragraph({
              text: "",
              pageBreakBefore: true,
            })
          );
        }

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: book.title,
                bold: true,
                font: DOCX_STYLES.fonts.heading,
                size: DOCX_STYLES.sizes.title * 2,
                color: "1A202C",
              }),
            ],

            spacing: {
              before: DOCX_STYLES.spacing.chapterBefore,
              after: DOCX_STYLES.spacing.chapterAfter,
            },
          })
        );

        const contentParagraphs = processMarkdownToDocxParagraphs(
          chapter.content || ""
        );
        sections.push(...contentParagraphs);
      } catch (error) {
        console.error(`Error processing chapter: ${index}`, error);
      }
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${book.title.replace(/[^a-zA-z0-9]/g, "_")}.docx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting document:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};
