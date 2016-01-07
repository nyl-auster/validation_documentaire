/**
 * Controller pour le formulaire d'upload et de création
 * d'une validation documentaire.
 */
(function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireFormController", ['validationDocumentaireService', 'userService', '$rootScope', 'validationDocumentaireSettings', '$scope', 'Upload', '$timeout', '$http', function(validationDocumentaireService, userService, $rootScope, validationDocumentaireSettings, $scope, Upload, $timeout, $http) {

    // Le formulaire est composé de plusieurs "pages", par défaut mettre sur la première page.
    $scope.currentStep = 1;

    // mock users for now
    userService.getAllUsersByGroup().then(function(users) {
      $scope.users = users;
    });

    // contiendra toutes les variables qui concernent
    // la table validationDocumentaire directement.
    $scope.validationDocumentaire = {};

    $scope.currentTab = 'entites';
    $scope.setCurrentTab = function(groupId) {
      $scope.currentTab = groupId;
    };

    $scope.getSelectedUserByGroupId = function(groupeId) {
      var selectedUsers = [];
      angular.forEach($scope.users[groupeId].groups, function(group) {
        angular.forEach(group.users, function(user) {
          if (user.selected) {
            selectedUsers.push(user);
          }
        });
      });
      return selectedUsers;
    };

    // si un user - valideur est déselectionner, déselectionner aussi
    // la case valideur
    $scope.ngChangeSelected = function(user) {
      if (!user.selected) {
        user.valideur = false;
      }
    };

    // si la case valider est coché, cocher aussi 
    // automatiquement la case user correspondante.
    $scope.ngChangeValideur = function(user) {
      if (user.valideur) {
        user.selected = true;
      }
    };

    // Sélectionner / Dé-selectionner tous les utilisateurs d'un sous-groupe
    $scope.selectAll = function(entite) {
      if (typeof this.checkAll == 'undefined') {
        this.checkAll = true;
      }
      angular.forEach(entite.users, function(value) {
        value.selected = this.checkAll;
        if (!this.checkAll) {
          value.valideur = this.checkAll;
        }
      }, this);
      this.checkAll = !this.checkAll;
    };

    /**
     * récupérer tous les utilisateurs cochés depuis le formulaire dans les onglets entités, service et groupes de travail.
     * @returns {Array}
     */
     
    $scope.getAllSelectedUsers = function() {
      var selectedUsers = [];
      // juste un hack pour ne pas enregistrer deux fois le même utilisateur
      var selectedUsersIds = [];
      // on itére sur les trois groupes possibles utilisateurs : service, entité, groupe de travail
      angular.forEach($scope.users, function(groupes) {
        // chaque groupe contient plusieurs sous=groupe (service 1, service 2 etc...)
        // on itère les sous-groupes pour trouver les utilisateur dans chaque sous-groupe
        angular.forEach(groupes.groups, function(groupe) {
          angular.forEach(groupe.users, function(user) {
            if (user.selected && selectedUsersIds.indexOf(user.id) === -1) {
              //selectedUsers[user.id] = user;
              selectedUsersIds.push(user.id);
              selectedUsers.push(user);
            }
          });

        });
      });
      console.log(selectedUsers);
      return selectedUsers;
    };
    

    $scope.setPrioriteOptionSelected = function(option) {
      $scope.prioriteOptionSelected = option;
    };

    // Demander la liste des priorités existances au serveur via un webservice.
    // demander au serveur la liste des priorités existantes :

    //Ne marche : au retour de la promesse, on perd l'option par défaut !
    $scope.priorites = [];
    $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentairePrioriteGetAll').then(function(response) {
      $scope.prioritesOptions = response.data.result;
      $scope.prioriteOptionSelected = $scope.prioritesOptions[1];
    });


    // permet d'afficher telle ou telle page du formulaire d'upload de fichiers
    $scope.goToStep = function(number) {
      $scope.currentStep = number;
    };

    // Garder en mémoire la liste des fichiers que l'utilisateur veut envoyer au serveur.
    // Appellé au moment où l'utilisateur ajoute un fichier.
    $scope.addFileToQueue = function(files) {
      $scope.files = files;
    };

    // enleve un fichier de la liste des fichiers que l'utilisateur a ajouté via
    // le formulaire d'upload (bouton remove)
    $scope.removeFileFromQueue = function(index) {
      $scope.files.splice(index, 1);
    };

    userService.getCurrentUser().then(function(currentUser) {
      $scope.currentUser = currentUser;
    });

    // Uploader les fichiers sur le serveur puis créer en base
    // la validation documentaire correspondant si l'upload est réussi
    $scope.enregistrerDemande = function() {

      var validationDocumentaireId = null;
      var currentUserId = null;

      // récupérer l'id de l'utilisateur courant
      userService.getCurrentUserId()

      // puis enregistrer en base sa demande
      .then(function(userId) {
          currentUserId = userId;
          var datas = {};
          datas.libelle = $scope.validationDocumentaire.libelle; // Ajout par Charlie le 23/12/2015
          datas.description = $scope.validationDocumentaire.description;
          datas.priorite_id = $scope.prioriteOptionSelected.id;
          datas.date_cloture = $scope.validationDocumentaire.date_cloture;
          datas.id_utilisateur = userId;
          // insertion en base de données
          return validationDocumentaireService.insert(datas);
        })
        // puis uploader les fichiers en créant un sous-repertoire nommé
        // selon l'id de la validation documentaire précédemment créee
        .then(function(lastInsertId) {
          validationDocumentaireId = lastInsertId;
          return uploadFiles($scope.files, lastInsertId);
        })
        // puis insérer les "destinataires" : les utilisateurs affiliés à cette demande
        // ainsi que leur status de valideur.
        .then(function() {

          var selectedUsers = $scope.getAllSelectedUsers();
          angular.forEach(selectedUsers, function(user) {
            var datas = {};
            datas.id_validation_documentaire = validationDocumentaireId;
            datas.id_utilisateur = user.id
            datas.valideur = user.valideur == true ? 1 : 0;
            validationDocumentaireService.insertDestinataire(datas);
          });

        })
        // Ajout le 23/12/2015
        // Notification
        .then(function() {

          var datas = {};
          datas.id = validationDocumentaireId;
          datas.event = 'create';
          validationDocumentaireService.sendEmailToDestinaires(datas);

        })

      // quand l'upload est terminé :
      .then(
        // en cas de succès
        function(response) {
          // rediriger vers la page de confirmation de l'upload
          $scope.goToStep(3);
          // On lance un évènement comme quoi nous venons d'insérer une nouvelle validation en base.
          $rootScope.$emit('validationDocumentaireAfterInsert');
        },

        // en cas d'erreur
        function(response) {
          if (response.status > 0) {
            $scope.errorMsg = response.status + ': ' + response.data;
          }
        },

        // callback de notification, permet d'afficher la progression
        // de l'upload dans notre cas.
        function(evt) {
          $scope.progress =
            Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }

      );


    };

    /**
     * envoyer les fichiers "pour de vrai" sur le serveur, via le module ng-Upload.
     * @return Promise
     */
    function uploadFiles(files, directory) {
      // on envoie à notre action la liste des fichiers qu'on veut uploader
      return Upload.upload({
        url: validationDocumentaireSettings.webservicesBaseUrl + 'upload',
        data: {
          files: files
        },
        params: {
          directory: directory
        }
      });
    }

    $scope.getDatetime = new Date();

  }]);

})();