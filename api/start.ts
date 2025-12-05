import app from "./index";

const port = process.env.PORT || 10000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
