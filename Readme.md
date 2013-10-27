# CCU.IO-Highcharts

aktuelle Version: 1.0.0

Visualisierung der CCU.IO Logs mittels Highcharts/Highstock

## Installation / Dokumentation

Vorraussetzung ist eine funktionierende [CCU.IO](https://github.com/hobbyquaker/ccu.io) Installation

  * [Dieses Zip-File](https://github.com/hobbyquaker/CCU-IO-Highcharts/archive/master.zip) entpacken und den Ordner charts in das www-Verzeichnis von CCU.IO kopieren
  * http://ccu-io-server:ccu-io-port/charts/menu.html aufrufen

In der Datei config.js können Optionen für einzelne Datenpunkte vorgenommen werden.


## Changelog

### 1.0.0
  * (Hobbyquaker) Konfiguration der Serien-Eigenschaften in config.js
  * (Hobbyquaker) Menü-Seite setzt Parameter nun in Hash (somit können Menüseiten mit bestimmten Settings als Bookmark gespeichert werden)
  * (Hobbyquaker) Bugfix - überflüssiges Laden von Logfiles wenn Datenpunkt im via period definierten Zeitraum nicht vorhanden war
  * (Hobbyquaker) Code aufgeräumt, Javascript von Menüseite in eigene Datei ausgelagert
  * (Hobbyquaker) Update auf Highstock 1.3.7
  * (Hobbyquaker) Highstock, jQuery, jQueryUI und Multiselect wird nun aus dem ccu.io lib-Verzeichnis geladen
  * (Hobbyquaker) CCU.IO Version Prüfung und Alert eingebaut

### 0.9.12
  * (Hobbyquaker) Chart-Type spline für ACTUAL_TEMPERATURE

### 0.9.11
  * (Hobbyquaker) Bugfixes Live-Update

### 0.9.10
  * (Hobbyquaker) Live-Update der Charts

### 0.9.9
  * (Hobbyquaker) kleine Schönheitskorrektur: Menüseite wird erst angezeigt wenn Multiselects aufgebaut sind

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

Sie dürfen das Werk bzw. den Inhalt vervielfältigen, verbreiten und öffentlich zugänglich machen,
Abwandlungen und Bearbeitungen des Werkes bzw. Inhaltes anfertigen zu den folgenden Bedingungen:

  * **Namensnennung** - Sie müssen den Namen des Autors/Rechteinhabers in der von ihm festgelegten Weise nennen.
  * **Keine kommerzielle Nutzung** - Dieses Werk bzw. dieser Inhalt darf nicht für kommerzielle Zwecke verwendet werden.

Wobei gilt:
Verzichtserklärung - Jede der vorgenannten Bedingungen kann aufgehoben werden, sofern Sie die ausdrückliche Einwilligung des Rechteinhabers dazu erhalten.

Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN BESTIMMTEN ZWECK. Die Nutzung dieser Software erfolgt auf eigenes Risiko!