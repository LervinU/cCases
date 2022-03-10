const express = require('express');
const app = express();
const router = require('./src/Routes/cases.route');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json')

//Config
const port = process.env.PORT || 3000;

//Middleware
app.use(express.json());

//Routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/', router);

//Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})