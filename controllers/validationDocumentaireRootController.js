/**
 * Le controller parent de l'application. utilisé pour afficher la fenêtre de création
 * de demande de validation documentaire.
 */
(function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireRootController", ['validationDocumentaireService', '$rootScope', '$scope', 'ngDialog', 'validationDocumentaireSettings', function(validationDocumentaireService, $rootScope, $scope, ngDialog, validationDocumentaireSettings) {

    // get a "php" param from url.  Astuce qui permet de récupérer l'id d'une demande
    // depuis l'url sur les pages.php en appelant  $rootScope.getQueryParam('id').
    // Un peu l'équivalent de  $_GET['id'] en php.
    $rootScope.getQueryParam = function(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
    }

    /**
     * Ouvre une Popin affichant le formulaire de création de demande / d'upload
     * En utilisant le module ngDialog.
     */
    $scope.openPopin = function() {

      $scope.currentDialog = ngDialog.open({

        template: validationDocumentaireSettings.appPath + '/views/validationDocumentaireForm.html',
        // disable animation if you wish to!
        disableAnimation: false,
        overlay: true,
        // on affiche nous même un bouton d'annulation.
        showClose: false,
        // ne pas sortir de la popin si on clique à côté.
        closeByDocument: false,
        // ne pas sortir de la popin si on appuie sur la touche espace
        closeByEscape: false,
        // close confirmation if needed :
        preCloseCallback: function(value) {

          /*
          var nestedConfirmDialog = ngDialog.openConfirm({
              template:validationDocumentaireSettings.appPath + '/views/validationDocumentaireFormQuitConfirmation.html',
          });
          // NOTE: return the promise from openConfirm
          return nestedConfirmDialog;
          */

        }
      });
    };

  }]);

})();