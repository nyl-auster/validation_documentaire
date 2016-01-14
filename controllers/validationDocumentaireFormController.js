/**
 * Controller pour le formulaire d'upload et de création
 * d'une validation documentaire.
 */
(function() {

  "use strict";

  angular.module('validationDocumentaire').controller("validationDocumentaireFormController", ['validationDocumentaireService', 'userService', '$rootScope', 'validationDocumentaireSettings', '$scope', 'Upload', '$timeout', '$http', '$q', function(validationDocumentaireService, userService, $rootScope, validationDocumentaireSettings, $scope, Upload, $timeout, $http, $q) {

    // Le formulaire est composé de plusieurs "pages", par défaut mettre sur la première page.
    $scope.currentStep = 1;

    // les utilisateurs à sélectionner comme destinataires
    userService.getAllUsersByGroup().then(function(users) {
      $scope.users = users;
    });

    // contiendra toutes les variables qui concernent
    // la table validationDocumentaire directement.
    $scope.validationDocumentaire = {};

    // onglet actif par défaut pour la sélection d'utilisateurs.
    $scope.currentTab = 'entites';

    // changer l'onglet actif de sélection d'utilisateurs.
    $scope.setCurrentTab = function(groupId) {
      $scope.currentTab = groupId;
    };

    // trouver les utilisateurs qui ont été sélectionné au sein d'un groupe
    // particulier (entité, service etc...)
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

    // si un user - valideur est déselectionner, désélectionner aussi la case valideur
    $scope.ngChangeSelected = function(user) {
      if (!user.selected) {
        user.valideur = false;
      }
    };

    // si la case valideur est cochée, cocher aussi 
    // automatiquement la case user correspondante.
    $scope.ngChangeValideur = function(user) {
      if (user.valideur) {
        user.selected = true;
      }
    };

    // Sélectionner / Dé-selectionner tous les utilisateurs d'un sous-groupe
    // quand on clique sur le nom du sous-groupe
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

    // récupérer TOUS les utilisateurs qui ont été sélectionnées en tant que destintaataires.
    $scope.getAllSelectedUsers = function() {
      var selectedUsers = [];
      // juste un hack pour ne pas enregistrer deux fois le même utilisateur
      // dans le cas où un même utilisateur appartient à plusieurs groupes en même temps.
      var selectedUsersIds = [];
      // on itére sur les trois groupes possibles utilisateurs : service, entité, groupe de travail
      angular.forEach($scope.users, function(groupes) {
        // chaque groupe contient plusieurs sous=groupe (service 1, service 2 etc...)
        // on itère les sous-groupes pour trouver les utilisateur dans chaque sous-groupe
        angular.forEach(groupes.groups, function(groupe) {
          angular.forEach(groupe.users, function(user) {
            if (user.selected && selectedUsersIds.indexOf(user.id) === -1) {
              selectedUsersIds.push(user.id);
              selectedUsers.push(user);
            }
          });

        });
      });
      return selectedUsers;
    };

    $scope.setPrioriteOptionSelected = function(option) {
      $scope.prioriteOptionSelected = option;
    };

    // Demander la liste des priorités existances au serveur via un webservice.
    $scope.priorites = [];
    $http.get(validationDocumentaireSettings.webservicesBaseUrl + 'validationDocumentairePrioriteGetAll').then(function(response) {
      $scope.prioritesOptions = response.data.result;
      $scope.prioriteOptionSelected = $scope.prioritesOptions[1];
    });

    // permet d'afficher telle ou telle page du formulaire d'upload de fichiers
    // qui est composé de plusieurs étapes
    $scope.goToStep = function(number) {
      $scope.currentStep = number;
    };

    // Garder en mémoire la liste des fichiers que l'utilisateur veut envoyer au serveur.
    // Appellé au moment où l'utilisateur ajoute en drag and drop un fichier.
    $scope.addFileToQueue = function(files) {
      $scope.files = files;
    };

    // enleve un fichier de la liste des fichiers que l'utilisateur a ajouté via
    // le formulaire d'upload (bouton remove)
    $scope.removeFileFromQueue = function(index) {
      $scope.files.splice(index, 1);
    };

    // l'utilisateur actuellement connecté récupéré par webservice
    userService.getCurrentUser().then(function(currentUser) {
      $scope.currentUser = currentUser;
    });


    // Insérer la validation documentaire en base à partir des informations du formulaire
    // retourne une promesse contenant le dernier id inséré en base.
    function validationDocumentaireInsert(userId) {
      var datas = {};
      datas.libelle = $scope.validationDocumentaire.libelle; // Ajout par Charlie le 23/12/2015
      datas.description = $scope.validationDocumentaire.description;
      datas.priorite_id = $scope.prioriteOptionSelected.id;
      datas.date_cloture = $scope.validationDocumentaire.date_cloture;
      datas.id_utilisateur = userId;
      // insertion en base de données
      return validationDocumentaireService.insert(datas);
    };

    // Insérer tous les destinataires liés à une validation documentaire
    // retourne une promesse
    function destinatairesInsert(selectedUsers, validationDocumentaireId) {
      return $q.all(selectedUsers.map(function(user) {
        var datas = {};
        datas.id_validation_documentaire = validationDocumentaireId;
        datas.id_utilisateur = user.id
        datas.valideur = user.valideur == true ? 1 : 0;
        return validationDocumentaireService.insertDestinataire(datas);
      }));
    };

    // Envoyer le mail à tous les destinataires d'une validation documentaire
    // retourne une promesse
    function sendEmailToDestinaires(validationDocumentaireId) {
      var datas = {};
      datas.id = validationDocumentaireId;
      datas.event = 'create';
      return validationDocumentaireService.sendEmailToDestinaires(datas);
    }

    // envoyer les fichiers "pour de vrai" sur le serveur, via le module ng-Upload.
    // @return Promise
    function uploadFiles(files, directory) {
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

    /**
     * La fonction clef qui permet de créer une nouvelle demande de validation documentaire
     * une fois que le formulaire est rempli.
     */
    $scope.enregistrerDemande = function() {

      var validationDocumentaireId = null;

      $scope.progressionEnregistrement = '';

      // récupérer l'id de l'utilisateur courant
      userService.getCurrentUserId()

      // 1 - INSERTION VALIDATION DOCUMENTAIRE EN BASE
      .then(function(userId) {
        $scope.progressionEnregistrement = 'Insertion validation documentaire en base...';
        return validationDocumentaireInsert(userId);
      })

      // 2 - INSERTION DES DESTINATAIRES EN BASE
      .then(function(lastValidationDocumentaireId) {
        $scope.progressionEnregistrement += 'Inserée avec id ' + lastValidationDocumentaireId + '. Insertion des destinataires en base ...';
        // enregistrer l'id de validation pour s'en resservir plus bas.
        validationDocumentaireId = lastValidationDocumentaireId
        return destinatairesInsert($scope.getAllSelectedUsers(), validationDocumentaireId);
      })

      // 3 - UPLOAD DES FICHIERS SUR LE SERVEUR
      .then(function(response) {
        $scope.progressionEnregistrement += 'upload des fichiers en cours...';
        return uploadFiles($scope.files, validationDocumentaireId);
      })

      // 4 - ENVOI DES EMAILS AUX DESTINATAIRES
      .then(

        // en cas de succès de l'upload des fichiers
        function(response) {
          $scope.progressionEnregistrement += 'Fichiers uploadés avec succès...';
          $scope.progressionEnregistrement += 'Envoi des emails de notifications...';
          return sendEmailToDestinaires(validationDocumentaireId);
        },

        // en cas d'erreur de l'upload
        function(response) {
          if (response.status > 0) {
            $scope.errorMsg = response.status + ': ' + response.data;
          }
        },

        // notification de l'upload : affichage de la barre de progression d'upload des fichiers
        function(evt) {
          $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          $scope.progressionEnregistrement += $scope.progress;
        }

      )

      // 5 - REDIRECTION VERS LA PAGE DE CONFIRMATION
      .then(function(response) {
        $scope.progressionEnregistrement += 'Succès de la création de la demande.';
        // rediriger vers la page de confirmation de la création de la validation documentaire
        $scope.goToStep(3);
        // On lance un évènement comme quoi nous venons d'insérer une nouvelle validation en base.
        $rootScope.$emit('validationDocumentaireAfterInsert');
      });

    };

    $scope.getDatetime = new Date();

  }]);

})();