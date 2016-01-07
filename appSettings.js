/**
 * Création de settings pour notre application
 */

// dans une fonction auto-invoquée pour ne pas polluer le scope global
(function(){ 

    "use strict";

    // déclaration des settings lié à notre module.
    angular.module('validationDocumentaire').constant('validationDocumentaireSettings', {

        // pour construire les urls de nos webservices : voir 
        // action.validationDocumentaireWebservices.php.
        // example d'utilisation :
        // $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentaireGetAll')
        webservicesBaseUrl: "/ws/approvals.webservices.html?service=",

        // le chemin vers le dossier de notre application validationDocumentaire
        // pour ne pas le remarquer à chaque fois qu'on veut inclure un template par exemple.
        appPath: ASSETS_PATH + "js/plugins/validationDocumentaire"

    });

})();