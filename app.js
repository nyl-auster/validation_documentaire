/**
 * Le fichier de création du module angular "validationDocumentaire"
 * qui va gérer l'affichage de la création de demande de validation, du listing
 * et mettre à jour en temps réel des éléments de la fiche de demande de validation.
 */

(function() {

    "use strict";

    // création du module et de ses dépendances.
    var module = angular.module('validationDocumentaire', [
        'ui.router', // creation des routes angular
        'ngFileUpload', // upload des fichiers sur le serveur
        'ngDialog', // fenêtre modale
        'ui.bootstrap' // affichage d'éléments boostrap via directives angular.
    ]);

    module.run(['$rootScope', 'validationDocumentaireSettings', function($rootScope, validationDocumentaireSettings) {

        // injecter nos settings dans le "rootscope"
        // De cette manière on peut accéder facilement à nos settings depuis un template
        // car tous les templates hérite du scope racine.
        $rootScope.validationDocumentaireSettings = validationDocumentaireSettings;
    }]);


})();