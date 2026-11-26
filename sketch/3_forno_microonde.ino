// Il forno a microonde
// Arduino Lab (allenamento) - https://layer8panic.github.io/ArduinoTest/
// Elenco dei pin:
//   LED verde -> pin 11 (con resistenza 220 ohm verso GND)
//   LED arancione -> pin 12 (con resistenza 220 ohm verso GND)
//   pulsante -> pin 2 (altro lato al 5V, pull-down 10 kohm verso GND)

int pulsante = 2;                    // pulsante sul pin 2
int ledVerde = 11;                   // LED verde sul pin 11
int ledArancione = 12;               // LED arancione sul pin 12
int stato = 0;                       // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);          // il pulsante ascolta
  pinMode(ledVerde, OUTPUT);         // il verde comanda
  pinMode(ledArancione, OUTPUT);     // l’arancione comanda
  Serial.begin(9600);                // avvio il monitor
}

void loop() {
  stato = digitalRead(pulsante);     // leggo il pulsante
  if (stato == HIGH) {               // premuto: cuoce
    digitalWrite(ledVerde, LOW);     // spengo il verde
    Serial.println("CUOCE");         // scrivo CUOCE
    digitalWrite(ledArancione, HIGH); // arancione acceso...
    delay(500);                      // ...per 500 ms
    digitalWrite(ledArancione, LOW); // arancione spento...
    delay(500);                      // ...per 500 ms
  } else {                           // rilasciato: pronto
    digitalWrite(ledArancione, LOW); // l’arancione resta spento
    digitalWrite(ledVerde, HIGH);    // verde acceso fisso
    Serial.println("PRONTO");        // scrivo PRONTO
    delay(100);                      // pausa per il monitor
  }
}
