/**
 * Le fichier de création du module angular "validationDocumentaire"
 * qui va gérer l'affichage des pages liées à la validation des documents sur le site:
 * Upload, listing, commentaires etc ...
 */

(function() {

    "use strict";

    // création du module et de ses dépendances.
    var module = angular.module('validationDocumentaire', [
        'ui.router',
        'ngFileUpload',
        'ngDialog',
        'ui.bootstrap'
    ]);

    module.run(['$rootScope', 'validationDocumentaireSettings', function($rootScope, validationDocumentaireSettings) {

        // inject our settings in rootscope
        // De cette manière on peut accéder facilement à nos settings depuis un template
        // car tous les templates hérite du scope racine.
        $rootScope.validationDocumentaireSettings = validationDocumentaireSettings;
    }]);


    /////////////////////



    /////////////////


})();