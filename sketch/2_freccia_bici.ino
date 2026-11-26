// La freccia della bici
// Arduino Lab (allenamento) - https://layer8panic.github.io/ArduinoTest/
// Elenco dei pin:
//   LED arancione -> pin 12 (con resistenza 220 ohm verso GND)
//   pulsante -> pin 2 (altro lato al 5V, pull-down 10 kohm verso GND)

int pulsante = 2;                    // pulsante sul pin 2
int ledArancione = 12;               // LED arancione sul pin 12
int stato = 0;                       // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);          // il pulsante ascolta
  pinMode(ledArancione, OUTPUT);     // il LED comanda
  Serial.begin(9600);                // avvio il monitor
}

void loop() {
  stato = digitalRead(pulsante);     // leggo il pulsante
  if (stato == HIGH) {               // se è premuto...
    Serial.println("FRECCIA");       // scrivo FRECCIA
    digitalWrite(ledArancione, HIGH); // accendo
    delay(300);                      // resto acceso 300 ms
    digitalWrite(ledArancione, LOW); // spengo
    delay(300);                      // resto spento 300 ms
  } else {                           // altrimenti...
    digitalWrite(ledArancione, LOW); // LED spento
    Serial.println("SPENTA");        // scrivo SPENTA
    delay(100);                      // pausa per il monitor
  }
}
