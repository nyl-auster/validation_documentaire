/**
 * Le controller pour les commentaires sur les fiches validation.
 */
(function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireCommentsController", ['ngDialog', '$http', '$location', '$rootScope', '$scope', 'userService', 'validationDocumentaireSettings', 'validationDocumentaireService', function(ngDialog, $http, $location, $rootScope, $scope, userService, validationDocumentaireSettings, validationDocumentaireService) {
	
    // passera à true quand un commentaire sera en cours d'enregistrement
    // pour qu'on ne puisse pas cliquer sur le bouton de soumission à ce
    // moment là.
    $scope.insertingComment = false;

    // affiche l'erreur de commentaire vide si on a cliqué sur refusé
    $scope.commentIsEmptyRefusError = false;
    $scope.commentIsEmptyValideError = false;
    $scope.commentIsEmptyError = false;

    // object commentaire qui sera envoyé aux webservices
    $scope.comment = {};
    $scope.comment.message = '';
    $scope.comment.validationDocumentaireEtat = '';
    $scope.comment.poste_le = '';
    $scope.comment.id_validation_documentaire = $scope.validationDocumentaireId = $rootScope.getQueryParam('id');

    $scope.refreshInfos = function() {
      $http.get('/ws/approvals.webservices.php?service=getInfosAfterComment&id=' + $rootScope.getQueryParam('id'))
        .then(function(response) {
          $scope.isOpen = response.data.result.isOpen;
          $scope.statut = response.data.result.statut;
          $scope.nbValidations = response.data.result.nbValidations;
          $scope.tauxValidation = response.data.result.tauxValidation;
          $scope.autoriseValidationCommentaire = response.data.result.autoriseValidationCommentaire;
          $scope.autoriseRefusCommentaire = response.data.result.autoriseRefusCommentaire;
          $scope.autoriseCommentaires = response.data.result.autoriseCommentaires;
          $scope.destinataires = response.data.result.destinataires;
        });
    };

    $scope.refreshInfos();



    // récupérer les information de l'utilisateur courant
    userService.getCurrentUser().then(function(user) {
      $scope.comment.id_utilisateur = user.id;
      $scope.comment.utilisateur_nom = user.nom;
      $scope.comment.utilisateur_prenom = user.prenom;
      $scope.comment.avatar = user.avatar;
    });

    // charger les commentaires pour la premire fois
    validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments) {
      $scope.comments = comments;
    });

    // supprimer un commentaire
    $scope.commentDelete = function(comment) {
      validationDocumentaireService.deleteComment(comment).then(function() {
        // rafraichir les commentaires
        validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments) {
          $scope.comments = comments;
        });
      });
    };

    // vérifier si le champ commentaire est vide
    $scope.commentIsEmpty = function() {
      if (!$scope.comment.message) {
        return true;
      }
      return false;
    };

    $scope.commentValidateAndInsert = function(validationDocumentaireEtat) {

      if ($scope.commentIsEmpty() && validationDocumentaireEtat == 'refuse') {
        $scope.commentIsEmptyRefusError = true;
        $scope.commentIsEmptyValideError = false;
        $scope.commentIsEmptyError = false;
        return false;
      } else {
        $scope.commentIsEmptyRefusError = false;
      }

      if ($scope.commentIsEmpty() && validationDocumentaireEtat == 'valide') {
        $scope.commentIsEmptyRefusError = false;
        $scope.commentIsEmptyError = false;
        $scope.commentIsEmptyValideError = true;
        return false;
      } else {
        $scope.commentIsEmptyValideError = false;
      }

      if ($scope.commentIsEmpty() && validationDocumentaireEtat == '') {
        $scope.commentIsEmptyRefusError = false;
        $scope.commentIsEmptyError = true
        $scope.commentIsEmptyValideError = false;
        return false;
      } else {
        $scope.commentIsEmptyError = false;
      }

      if (validationDocumentaireEtat == 'refuse') {
        $scope.openConfirmRefuse(validationDocumentaireEtat).then(function() {
          $scope.commentInsert(validationDocumentaireEtat);
        })
      }

      if (validationDocumentaireEtat == 'valide') {
        $scope.openConfirmValide(validationDocumentaireEtat).then(function() {
          $scope.commentInsert(validationDocumentaireEtat);
        })
      }
       
      // pas de confirmation pour le moment pour un commentaire simple.
      if (validationDocumentaireEtat == '') {
        $scope.commentInsert(validationDocumentaireEtat);
      }

    };

    $scope.commentInsert = function(validationDocumentaireEtat) {

      $scope.insertingComment = true;
      $scope.comment.validationDocumentaireEtat = validationDocumentaireEtat;
      $scope.comment.poste_le = Date.now();
      validationDocumentaireService.insertComment($scope.comment)

      .then(function() {
        $scope.comment.message = '';
        // rafraichir les commentaires
        return validationDocumentaireService.getComments($scope.validationDocumentaireId)
      })

      .then(function(comments) {
        // puis mettre à jour la liste des commentaires affichés
        $scope.comments = comments;
        // on indique que l'insertion du nouveau commentaire est terminée
        $scope.insertingComment = false;

        // pour Charlie : on met à nouveau à jour le status 
        $scope.refreshInfos();

      });

    };


    // ouvre la popin de confirmation pour poster le commentaire
    // si on a cliqué sur le bouton refusé
    // retourne une promesse
    $scope.openConfirmRefuse = function(validationDocumentaireEtat) {
      return ngDialog.openConfirm({
        template: '\
        <p>Etes vous sûr de vouloir refuser cette demande ?</p>\
        <div class="ngdialog-buttons">\
        <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">Non</button>\
        <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Oui</button>\
        </div>',
        plain: true
      });
    };

    // ouvre la popin de confirmation pour poster le commentaire
    // si on a cliqué sur le bouton refusé
    // retourne une promesse
    $scope.openConfirmValide = function(validationDocumentaireEtat) {
      return ngDialog.openConfirm({
        template: '\
        <p>Etes vous sûr de vouloir valider cette demande ?</p>\
        <div class="ngdialog-buttons">\
        <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">Non</button>\
        <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Oui</button>\
        </div>',
        plain: true
      });
    };


  }]);

})();