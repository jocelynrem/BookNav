const app = require('./app');
console.log('App routes:', app._router.stack.filter(r => r.route).map(r => r.route.path));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Server started successfully');
});