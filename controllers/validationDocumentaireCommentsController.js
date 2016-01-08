/**
 * Le controller principale de l'application, appelé dans vue.php
 */
 (function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireCommentsController", ['$location', '$rootScope', '$scope', 'userService', 'validationDocumentaireSettings', 'validationDocumentaireService', function($location, $rootScope, $scope, userService, validationDocumentaireSettings, validationDocumentaireService) {

    // object commentaire qui sera envoyé aux webservices
    $scope.comment = {};
    $scope.comment.message = '';
    $scope.comment.validationDocumentaireEtat = '';
    $scope.comment.poste_le = '';
    $scope.comment.id_validation_documentaire = $scope.validationDocumentaireId = $rootScope.getQueryParam('id');
	
	userService.getCurrentUser().then(function(user){
      $scope.comment.id_utilisateur 	= user.id;
      $scope.comment.utilisateur_nom 	= user.nom;
      $scope.comment.utilisateur_prenom = user.prenom;
	  $scope.comment.avatar 			= user.avatar;
    });
	
    // charger les commentaires pour la premire fois
    validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments){
      $scope.comments = comments;
    });

    $scope.commentDelete = function(comment) {
      validationDocumentaireService.deleteComment(comment).then(function(){
        // rafraichir les commentaires
        validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments){
          $scope.comments = comments;
        }); 
      });
    };
    
    $scope.commentInsert = function(validationDocumentaireEtat) {
      $scope.comment.validationDocumentaireEtat = validationDocumentaireEtat;
      $scope.comment.poste_le = Date.now();
      validationDocumentaireService.insertComment($scope.comment).then(function(){
        $scope.comment.message = '';
        // rafraichir les commentaires
        validationDocumentaireService.getComments($scope.validationDocumentaireId).then(function(comments){
          $scope.comments = comments;
        });
      });
    };
    
  }]);

})();