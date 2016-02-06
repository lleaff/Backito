<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Pimp my Fractales</title>
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="js/colorpicker/bootstrap-colorpicker.min.css">
    <link rel="stylesheet" href="bootstrap/css/bootstrap_def.css">
    <link rel="stylesheet" href="css/defaut.css">
    <script src="js/jQuery/jQuery-2.1.4.min.js"></script>
    <script src="bootstrap/js/bootstrap.min.js"></script>
    <script src="js/colorpicker/bootstrap-colorpicker.min.js"></script>
    <script src="js/slimScroll/jquery.slimscroll.min.js"></script>
    <script src="js/appmin/app.min.js"></script>
  </head>
  <body class="hold-transition skin-blue layout-top-nav">
    <div class="wrapper">
      <header class="main-header">
        <nav class="navbar navbar-static-top" style="background-color:#222222;">
          <div class="container">
            <div class="navbar-header">
              <a href="index.php" class="navbar-brand"><b>Pimp my </b>Fractales</a>
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">
                <i class="fa fa-bars"></i>
              </button>
            </div>
          </div>
        </nav>
      </header>
      <div class="content-wrapper"  style="background: url(css/wall.jpg) no-repeat center fixed;-webkit-background-size: cover; background-size: cover;">
        <div class="container">
          <section class="content" style="padding-top:60px">
            <?php if (!empty($_GET)) { ?>
            <div class="alert alert-danger alert-dismissable">
              <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
                 <h4><i class="icon fa fa-ban"></i> Erreur !</h4>
                  Attention, les paramètres entrés sont invalides !
            </div>
            <?php } ?>
            <form action="php/show_image.php" method="post" onsubmit="form()">
             <div class="box box-success" style="max-width:600px; margin:0 auto; margin-bottom:20px">
                  <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-info-circle" style="color:#00A65A"></i>  Z <sub>n+1</sub> = Z<sub>n</sub><sup>k</sup> + c </h3>
                  </div>
                  <div class="box-body">
                    <div class="row">
                      <div class="col-xs-6">
                        <label>Nombre d'itérations (n)</label>
                        <input name="nb1" pattern="^[0-9]{1,}$" type="text" class="form-control" placeholder="Defaut: 50" style="margin:0 auto;text-align:center">
                      </div>
                      <div class="col-xs-6">
                        <label>Degré (k)</label>
                        <input name="nb2" pattern="^[0-9]{1,}$" type="text" class="form-control" placeholder="Defaut: 2"  style="margin:0 auto;text-align:center">
                      </div>
                    </div>
                  </div>
                </div>
              <div class="box box-warning" style="max-width:600px; margin:0 auto; margin-bottom:20px">
                  <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-picture-o" style="color:#F39C12"></i> Dimensions de l'image (option)</h3>
                  </div>
                  <div class="box-body">
                    <div class="row">
                      <div class="col-xs-5" style="padding-left:50px">
                        <input name="w" pattern="^[0-9]{1,}$" type="text" class="form-control" placeholder="Defaut: 640px" style="text-align:center">
                      </div>
                      <div class="col-xs-2">
                        <div style="text-align:center">x</div>
                      </div>
                      <div class="col-xs-5" style="padding-right:50px">
                        <input name="h" pattern="^[0-9]{1,}$" type="text" class="form-control" placeholder="Defaut: 480px" style="text-align:center">
                      </div>
                    </div>
                  </div>
                </div>
                    <div class="box box-primary" style="max-width:600px; margin:0 auto; margin-bottom:20px">
                  <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-paint-brush" style="color:#3C8DBC"></i> Couleurs (option)</h3>
                  </div>
                  <div class="box-body">
                    <div class="row">
                      <div class="col-xs-12" >
                        <div class="form-group">
                            <div class="radio" style="display:inline;">
                              <label>
                                <input type="radio" name="degrade" id="degrade1" value="option1" checked="">
                                Activer le dégradé de couleurs   
                              </label>
                            </div>
                            <div class="radio" style="display:inline; float:right;">
                              <label>
                                <input type="radio" name="degrade" id="degrade2" value="option2">
                                Désactiver le dégradé de couleurs
                              </label>
                            </div>
                          </div>
                       <div class="form-group" >
                      <label>Couleur de la fractale</label>
                      <div class="input-group my-colorpicker2 colorpicker-element">
                        <input name="color" pattern="^#[0-9a-zA-Z]{6}$" type="text" class="form-control" placeholder="Defaut: #000000 (noir)">
                        <div class="input-group-addon">
                          <i style="background-color: rgb(0, 0, 0);"></i>
                        </div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
              <center><input id="button" value=" Générer " type="submit" class="btn btn-default btn-flat btn" href="" style="margin-top:10px; background-color:white"><i class="fa fa-check"></i></input></center>
            </form>
          </section>
        </div>
      </div>
      <footer class="main-footer" style="background-color:#222222; border-color:#222222; color:white">
        <div class="container">
          <div class="pull-right hidden-xs">
            <b>Version</b> 1.0
          </div>
          <strong>Création</strong> - Prep'ETNA 2015
        </div>
      </footer>
    </div>
    <script>$(".my-colorpicker2").colorpicker();</script>
    <script language="javascript" type="text/javascript">
  	function form() 
  	{
  	  var Obj  = document.getElementById( 'button');
  		Obj.value ="Chargement en cours..."; 
  	} 
</script>
  </body>
</html>
