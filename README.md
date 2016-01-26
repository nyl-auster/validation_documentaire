#VALIDATION DOCUMENTAIRE

##Description

Application js en angular pour gérer les validations documentaires : création, listing, commentaires etc...


## Architecture technique :

### 1 - Les fonctions php de validationDocumentaireStorage.php

Les fonctions métiers en PHP en relation avec les validation Documentaire, qui communiquent avec la base de données pour récupérer / écrire les données.


### 2 - Les fonction php de approvals.webservices.php

C'est l'API Json concernant les validations documentaires. Ces json peuvent être récupéré par du javascript / angular par requête http.
Côté angular, on les récupérer via "$http", la librairie angular pour faire des rquêtes http et récupérer du json à partir d'une API.


### 3 - Les "services" de angular (dossier "services" dans le plugin validationDocumentaire)

Côté angular, les services (ou factory) "consomme$nt" ces json des webservices avec du javascript. Un service appelle dans notre cas avec $http.get ou http.post les webservices et retournent le résultat. 

Pourquoi ne pas simplement appeler nos json avec $http.get depuis les controllers js ? pour ne pas répéter 50 000 fois l'url des webservices appelées au sein des controllers. C'est principalement de la factorisation pure et dure, il est plus simple de marquer "validationDocumentaireService.getAll()" que d'écrire systématiquement $http.get("http://new.picdomeo.fr/ws/approvals.webservices.html?service=validationDocumentaireGetAll")


### 4 - les "controllers" et les "views" angular

On y appelle les services, qui au final consomment les json; pour mettre à jour en temps réel le html côté utilisateur / views. Le dossier views contient les templates html utilisés par angular.


