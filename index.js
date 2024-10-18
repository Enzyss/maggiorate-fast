
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path"; // Importa path per gestire i percorsi dei file
import { fileURLToPath } from "url";

// Create an Express app
const app = express();

// URI MongoDB Atlas - Sostituisci <username>, <password>, e <database> con i tuoi dettagli
const uri = "mongodb+srv://Enzysss:Immalisa123@laureaida.jtomo.mongodb.net/?retryWrites=true&w=majority&appName=LaureaIda";  // Sostituisci con la tua URI di connessione MongoDB Atlas
const PORT = 10000;
mongoose.connect(uri).then(() => {
  console.log("Database connected successfully.");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/send-email', (req, res) => {
  console.log(req.body);
  res.send('Data received');
});**/

const userSchema = new mongoose.Schema({
  nome: String,
  tavolo: String,
});

// Create a Mongoose model called "UserModel" based on the userSchema
const UserModel = mongoose.model("invitati", userSchema, "invitati");

app.post('/api/submit', async (req, res) => {
  const nome = req.body.nome;
  console.log('Nome ricevuto:' + req.body.nome);
  //res.send('Nome ricevuto con successo!');

  const userData = nome ? await UserModel.find({ nome: nome.toUpperCase() }) : await UserModel.find();

  // Send the user data as a JSON response
  //console.log(json(userData));
  console.log(userData[0].tavolo);
  //await res.sendFile(path.join(__dirname, 'success.html'));
  const tavolo = userData[0]?.tavolo;
  let image;
  let titolo;
  if (tavolo == 'pulcinella') {
    image = 'pulcinella1.png';
    titolo = 'Dicette Pulicinella: "mangiammo e bevimmo finchè ce uoglio a \'sta lucerna';
  } else if (tavolo == 'corno') {
    image = 'corno.png';
    titolo = 'Sciò, Sciò Ciucciuvè';
  }
  res.redirect(`/success.html?nome=${encodeURIComponent(image)}&titolo=${encodeURIComponent(titolo)}`);
});


// Set up a route in the Express application to handle GET requests to "/getUsers"
/**app.get("/getUsers", async (req, res) => {
  // Await fetching all user data from the database using the UserModel
  const nome = req.query.nome;
  console.log(nome);

  // Esegui la query sul database solo se il nome è presente
  const userData = nome ? await UserModel.find({ nome: nome }) : await UserModel.find();
  
  // Send the user data as a JSON response
  res.json(userData);
  console.log(userData);
}); **/
