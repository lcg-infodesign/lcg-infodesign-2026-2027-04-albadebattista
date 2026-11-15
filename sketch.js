let data;
let label = ""; 
let selectedID = -1; 
let shelfCounts = [0, 0, 0]; // indice 0 = scaffale 1, indice 1 = scaffale 2, indice 2 = scaffale 3
let maxCups = 0; //massimo valore delle cups al giorno
let maxShelf = 0; //massimo numero di contenitori su ogni scaffale 

const brandColors = {
  "General Mills":  "#f64113",
  "Kelloggs": "#f9988d",
  "Nabisco": "#04a4ab",
  "Post": "#feb603",
  "Quaker Oats": "#8379bf",
  "Ralston Purina": "#fa9400",
  "American Home Food Products": "#c3b108"
};

async function setup() {
  createCanvas(windowWidth, windowHeight);

  data = await loadTable("assets/cereal.csv", ",", "header"); //carico i dati 
  
  for (let r = 0; r < data.getRowCount(); r++) {
    maxCups = max(maxCups, data.getNum(r, "cups")); //trovo il massimo valore di riempimento del contenitore
    shelfCounts[data.getNum(r, "shelf") - 1]++; //conta il numero di contenitore per ogni scaffale 
  }

  maxShelf = max(shelfCounts); //trovo il massimo numero di contenitori che posso avere su uno scaffale 
}

//funzione per disegnare le ellissi che rappresentano i cereali
function drawCereal(cx, cy, w, h, angle, col) {
  push();
  translate(cx, cy);
  rotate(angle);

  stroke(0,30);
  strokeWeight(2);
  fill(col);
  ellipse(0, 0, w, h);

  fill("#435e06");           
  ellipse(0, 0, w * 0.4, h * 0.4);
  pop();
}

//funzione per disegnare i contenitori dei cereali
function drawBox(x,y,boxW,boxH) {
    fill(255,255,255,40); //riempimento bianco in trasparenza
    stroke("#f1e4cc");
    strokeWeight(2.5);
    rect(x, y, boxW, boxH, 5);
    //tappo del contenitore
    fill("#ed9542"); 
    noStroke(); 
    rect(x-2, y-2, boxW+4, 12,3)
}

//funzione di testo che appare quando si fa hover
function textHover(name, cups, labelX, labelY, boxW) {
  const label = name + " - " + cups + " cups";

  noStroke();
  fill("#435e06");
  textFont("monospace");
  textStyle(BOLD);
  textSize(14);
  textAlign(LEFT, CENTER);   

  //oltre a una certa soglia metto l'allineamento a destra altrimenti non vedo il testo perchè esce dalla pagina
  if (labelX > width / 1.2) {
  textAlign(RIGHT, CENTER);
  labelX = labelX + boxW; 
  }

  text(label, labelX, labelY);
}

function title() {
  const startX = width / 2 + 200;

  noStroke();
  fill("#f1e4cc");
  textFont("monospace");
  
  //titolo in alto
  textSize(20);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);    
  text("CEREALS ON THE SHELVES", startX , height/2-110); 
  
  //spiegazione parametri
  textSize(15);
  textStyle(NORMAL); 
  text("Livello di riempimento: numero di cups per singola porzione", startX , height/2-70);
  text("Posizione sugli scaffali: cereali distribuiti su ripiani espositivi\nin base al valore di shelf (da 1 a 3, dal basso verso l'alto)", startX , height/2-30);
  text("Colore: brand del prodotto", startX , height/2+10);

  //legenda colori
  const legendY = height/ 2 + 40;
  const  spacingX = 150; // distanza orizzontale tra una colonna e l'altra
  const  spacingY = 22;  // distanza verticale 
  let i = 0;

  //suddivido su 3 colonne 
  for (let brand in brandColors) {
    let col, row;
    if (i < 3) {
      col = 0;
      row = i;      
    } else if (i < 5) {
      col = 1;
      row = i - 3;   
    } else {
      col = 2;
      row = i - 5;   
    }
    
    const  x = startX + col * spacingX;
    const  y = legendY + row * spacingY;
    
    // disegno un cereale per ciascun colore del brand
    drawCereal(x + 8, y, 16, 14, 0, brandColors[brand]);
    //nome del brand
    noStroke();
    fill("#f1e4cc");
    textSize(13);
    textAlign(LEFT, CENTER);
    text(brand, x + 25, y);
    
    i++;
  }
  
}


function draw() {
  background("#435e06"); 
  const  margin = 10;
  let xPos = [0, 0, 0];
  label = "";  
  selectedID = -1;
  let labelCups = 0;
  let labelX = 0;
  let labelY = 0;
  const  rowHeight = height / 3; //ogni scaffale occupa un terzo dell'altezza
  const  cellWidth = (width-2*margin) / maxShelf; //ottengo la larghezza dei contenitori dividendo la larghezza per il numero massimo di contenitori
  //dimensioni del contenitore
  const  boxW = cellWidth * 0.8; //larghezza del contenitore
  const  boxH = rowHeight * 0.8; //altezza del contenitore

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++){
    const  currentShelf = data.getNum(rowNumber, "shelf") - 1; //scaffale su cui si trova
    const  currentCups = data.getNum(rowNumber, "cups"); //altezza del contenuto 
    const  currentBrand = data.getString(rowNumber, "mfr");
    const name = data.getString(rowNumber, "name");

    const  x = margin + xPos[currentShelf] * cellWidth + (cellWidth - boxW) / 2; //posizione x del contenitore
    const  y = (2 - currentShelf) * rowHeight + (rowHeight - boxH) / 2; //posizione y del contenitore
    
    const  fillH = boxH * (currentCups / maxCups); //altezza a cui devono arrivare i cereali in base al numero di cups
    const  w = boxW / 3;
    const  h = w * 0.85;
    const  col = 3; //colonne interne di cereali
    const  rows = floor(fillH / (h * 0.8)); //righe interne di cereali arrotondando per difetto

    randomSeed(rowNumber);  
    
    //ciclo for per disegnare i cereali dentro i contenitori uno per uno              
    for (let i = 0; i < rows; i++) { //scorro le righe dal basso verso l'alto
      const  shift = (i % 2) * (w / 4);      //creo uno sfasamento orizzontale 
      for (let j = 0; j < col; j++) { //scorro le colonne da sinistra a destra
        const  cx = x + w / 2 + j * w + shift - w / 8; //posizione x del cereale
        const  cy = y + boxH - h / 2 - i * h * 0.8; //posizione y del cereale 
        const  angle = random(-PI / 5, PI / 5); //inclinazione casuale per non averli tutti dritti in fila
        drawCereal(cx, cy, w, h, angle, brandColors[currentBrand]);
      }
    }

    //verifico se il mouse si trova sopra il contenitore 
    if (
      mouseX >= x &&
      mouseX <= x + boxW &&
      mouseY >= y &&
      mouseY <= y + boxH
    ) {
      selectedID = rowNumber; 
      label = name;
      labelCups = currentCups;
      labelX = x;
      labelY = (3 - currentShelf) * rowHeight - 13;
    }

    //contenitore trasparente dei cereali
    drawBox(x,y,boxW,boxH); 

    //scaffali 
    noStroke();
    fill("#f1e4cc");
    rect(0,(3 - currentShelf) * rowHeight-26, width, 27 ); 

    xPos[currentShelf]++;
  }
  //se label contiene qualcosa lo scrivo 
  if (label != "") {
    cursor(HAND);
    textHover(label, labelCups, labelX, labelY, boxW);
  } else {
    cursor(ARROW);
  }
  title(); 
}

function mousePressed() {
  if (selectedID !== -1) {
    const  myURL = "detail.html?cereal_id=" + selectedID;
    window.location.href = myURL;
  }
}
