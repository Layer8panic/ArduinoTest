// La lampada da scrivania
// Arduino Lab (allenamento) - https://layer8panic.github.io/ArduinoTest/
// Elenco dei pin:
//   LED giallo -> pin 12 (con resistenza 220 ohm verso GND)
//   pulsante -> pin 2 (altro lato al 5V, pull-down 10 kohm verso GND)

int pulsante = 2;                    // il pulsante è sul pin 2
int ledGiallo = 12;                  // il LED giallo è sul pin 12
int stato = 0;                       // qui salvo cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);          // il pin del pulsante ascolta
  pinMode(ledGiallo, OUTPUT);        // il pin del LED comanda
  Serial.begin(9600);                // apro il monitor seriale
}

void loop() {
  stato = digitalRead(pulsante);     // leggo il pulsante
  if (stato == HIGH) {               // se è premuto...
    digitalWrite(ledGiallo, HIGH);   // accendo il LED
    Serial.println("LUCE ACCESA");   // scrivo LUCE ACCESA
  } else {                           // altrimenti (rilasciato)...
    digitalWrite(ledGiallo, LOW);    // spengo il LED
    Serial.println("LUCE SPENTA");   // scrivo LUCE SPENTA
  }
  delay(100);                        // piccola pausa per non intasare il monitor
}
