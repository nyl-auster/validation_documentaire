(function() {

  "use strict";
	
	//angular filter pour la prise en compte des retours à la ligne
	angular.module('validationDocumentaire').filter('nl2br', function($filter) {
		return function(data) {
		   if (!data) return data;
		   return data.replace(/\n\r?/g, '<br />');
		 };
	});
	
  // affiche l'extension du fichier
  angular.module('validationDocumentaire').filter('fileExtension', function($filter) {
    return function(filename) {
      return filename.split(".").pop().toLowerCase();
    }
  });

    // retourne une class awesome font en fonction de l'extension du fichier
    angular.module('validationDocumentaire').filter('fileAwesomeFontIconClass', function($filter) {
    return function(filename) {

      var fileExtension = filename.split(".").pop().toLowerCase();

      if (fileExtension == 'zip') return "fa fa-file-archive-o";
      if (fileExtension == 'pdf') return "fa fa-file-pdf-o";
      if (fileExtension.indexOf("xls") !== -1 || fileExtension == 'csv') return "fa fa-file-excel-o";
      if (fileExtension.indexOf("doc") !== -1) return "fa fa-file-word-o";
      if (fileExtension.indexOf("ppt") !== -1) return "fa fa-file-powerpoint-o";
      if (fileExtension.indexOf("txt") !== -1) return "fa fa-file-text-o";

      // image
      if (fileExtension == 'jpg') return "fa fa-file-image-o";
      if (fileExtension == 'jpeg') return "fa fa-file-image-o";
      if (fileExtension == 'png') return "fa fa-file-image-o";
      if (fileExtension == 'gif') return "fa fa-file-image-o";
      if (fileExtension == 'tif') return "fa fa-file-image-o";

      // vidéo
      if (fileExtension == 'mov') return "fa fa-file-video-o";
      if (fileExtension == 'avi') return "fa fa-file-video-o";
      if (fileExtension == 'mp4') return "fa fa-file-video-o";
      if (fileExtension == 'mkv') return "fa fa-file-video-o";


      // son
      if (fileExtension == 'mp3') return "fa fa-file-audio-o";
      if (fileExtension == 'wave') return "fa fa-file-audio-o";

      if (fileExtension == 'html') return "fa fa-file-code-o";
      if (fileExtension == 'js') return "fa fa-file-code-o";
      if (fileExtension == 'php') return "fa fa-file-code-o";
      if (fileExtension == 'sql') return "fa fa-file-code-o";

      return "fa fa-file-o";

    }
  });


})();

/*

Icone générique qui sera utilisée lorsque le type n’est pas reconnu : fa fa-file-o
Pour les types identifiés :
Pour les ZIP :             fa fa-file-archive-o
Pour les fichiers AUDIO :         fa fa-file-audio-o
Pour les fichiers de type CODE (html…) :    fa fa-file-code-o
Pour les fichiers EXCEL :         fa fa-file-excel-o
Pour les fichiers de type IMAGE (png, jpg, jpeg, gif…) :  fa fa-file-image-o
Pour les fichiers de type VIDEO (.mov, .avi, .mp4…) :   fa fa-file-video-o
Pour les fichiers PDF :           fa fa-file-pdf-o
Pour les fichiers POWERPOINT :      fa fa-file-powerpoint-o
Pour les fichiers de type TEXT (.txt…) :      fa fa-file-text-o
Pour les fichiers WORD :        fa fa-file-word-o
Pour les fichiers ZIP :           fa fa-file-zip-o

Exemple d’utilisation : <i class="fa fa-file-o"></i>
*/
