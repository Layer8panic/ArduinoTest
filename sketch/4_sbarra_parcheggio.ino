// La sbarra del parcheggio
// Arduino Lab (allenamento) - https://layer8panic.github.io/ArduinoTest/
// Elenco dei pin:
//   LED rosso -> pin 12 (con resistenza 220 ohm verso GND)
//   LED giallo -> pin 11 (con resistenza 220 ohm verso GND)
//   LED verde -> pin 10 (con resistenza 220 ohm verso GND)
//   pulsante -> pin 2 (altro lato al 5V, pull-down 10 kohm verso GND)

int pulsante = 2;                    // pulsante sul pin 2
int ledRosso = 12;                   // rosso sul pin 12
int ledGiallo = 11;                  // giallo sul pin 11
int ledVerde = 10;                   // verde sul pin 10
int stato = 0;                       // cosa legge il pulsante
int conta = 0;                       // quante auto sono passate

void setup() {
  pinMode(pulsante, INPUT);          // il pulsante ascolta
  pinMode(ledRosso, OUTPUT);         // i LED comandano
  pinMode(ledGiallo, OUTPUT);        // ledGiallo comanda (uscita)
  pinMode(ledVerde, OUTPUT);         // ledVerde comanda (uscita)
  Serial.begin(9600);                // avvio il monitor
}

void loop() {
  stato = digitalRead(pulsante);     // leggo il pulsante
  if (stato == HIGH) {               // arriva un’auto
    conta = conta + 1;               // un’auto in più
    Serial.print("Auto numero ");    // scrivo il testo senza andare a capo
    Serial.println(conta);           // scrivo il numero e vado a capo
    Serial.println("AUTO IN ARRIVO"); // avviso
    digitalWrite(ledRosso, LOW);     // spengo il rosso
    digitalWrite(ledGiallo, HIGH);   // accendo il giallo
    delay(1000);                     // giallo per 1 secondo
    digitalWrite(ledGiallo, LOW);    // spengo il giallo
    digitalWrite(ledVerde, HIGH);    // accendo il verde
    Serial.println("PASSA PURE");    // avviso
    delay(3000);                     // verde per 3 secondi
    digitalWrite(ledVerde, LOW);     // spengo il verde
    digitalWrite(ledGiallo, HIGH);   // avviso: il giallo lampeggia 3 volte
    delay(200);                      // acceso 200 ms
    digitalWrite(ledGiallo, LOW);    // spento
    delay(200);                      // spento 200 ms
    digitalWrite(ledGiallo, HIGH);   // lampeggio 2
    delay(200);                      // aspetto 200 ms
    digitalWrite(ledGiallo, LOW);    // spengo ledGiallo
    delay(200);                      // aspetto 200 ms
    digitalWrite(ledGiallo, HIGH);   // lampeggio 3
    delay(200);                      // aspetto 200 ms
    digitalWrite(ledGiallo, LOW);    // spengo ledGiallo
    delay(200);                      // aspetto 200 ms
    digitalWrite(ledRosso, HIGH);    // torna il rosso
  } else {                           // a riposo
    digitalWrite(ledRosso, HIGH);    // rosso acceso
    digitalWrite(ledGiallo, LOW);    // giallo spento
    digitalWrite(ledVerde, LOW);     // verde spento
  }
}
