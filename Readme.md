# CCU.IO-Highcharts

aktuelle Version: 0.9.8

Visualisierung der CCU.IO Logs mittels Highcharts/Highstock

## Installation

  * Dieses Zip-File https://github.com/hobbyquaker/CCU-IO-Highcharts/archive/master.zip entpacken und den Ordner charts in das www-Verzeichnis von ccu.io entpacken
  * http://ccu-io-server:8080/charts/menu.html aufrufen


## Todo/Roadmap

  * Live-Aktualisierung der Charts
  * Perfomance-Optimierung

## Changelog

### 0.9.8
  * (Hobbyquaker) Laden der Logs via jQuery.ajax statt via Socket.IO -> alte Logs verbleiben im Browser-Cache -> bessere Perfomance! erfordert CCU.IO >= 0.9.28

### 0.9.7
  * (Hobbyquaker) Bugfix period-Parameter

### 0.9.6

  * (Hobbyquaker) Bugfix period-Parameter
  * (Hobbyquaker) Bugfix range-Parameter
  * (Bluefox) automatische Weiterleitung zur Menü-Seite wenn keine Datenpunkte gewählt sind
  * (Bluefox) Leerzeichen im Value


## Copyright, Lizenz, Bedingungen

Copyright (c) 2013 [hobbyquaker](https://github.com/hobbyquaker)

Lizenz: [CC BY-NC 3.0](http://creativecommons.org/licenses/by-nc/3.0/de/)


Die Nutzung dieser Software erfolgt auf eigenes Risiko. Der Author dieser Software kann für eventuell auftretende Folgeschäden nicht haftbar gemacht werden!

