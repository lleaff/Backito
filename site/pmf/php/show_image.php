<?php
require_once('hextorgb.php');
require_once('create_tab_params.php');
require_once('check.php');
require_once('mandel.php');

$img = check();
?>
 <!DOCTYPE html>
 <html>
     <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Pimp my Fractales</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <link rel="stylesheet" href="../bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
        <link rel="stylesheet" href="../js/colorpicker/bootstrap-colorpicker.min.css">
        <link rel="stylesheet" href="../bootstrap/css/bootstrap_def.css">
        <link rel="stylesheet" href="../css/defaut.css">
        <script src="../js/jQuery/jQuery-2.1.4.min.js"></script>
        <script src="../bootstrap/js/bootstrap.min.js"></script>
        <script src="../js/slimScroll/jquery.slimscroll.min.js"></script>
        <script src="../js/appmin/app.min.js"></script>
    </head>
    <body class="hold-transition skin-blue layout-top-nav">
        <div class="wrapper">
          <header class="main-header">
            <nav class="navbar navbar-static-top" style="background-color:#222222;">
              <div class="container">
                <div class="navbar-header">
                  <a href="../index.php" class="navbar-brand"><b>Pimp my </b>Fractales</a>
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">
                    <i class="fa fa-bars"></i>
                </button>
            </div>
        </div>
    </nav>
    </header>
    <div class="content-wrapper"  style="background: url(../css/wall.jpg) no-repeat center fixed;-webkit-background-size: cover; background-size: cover;">
        <div class="container">
          <section class="content" style="padding-top:60px">
              <div class="box box-success" style="max-width:600px; margin:0 auto; margin-bottom:0px">
                  <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-check" style="color:#00A65A"></i> Image générée :</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                      <div class="col-xs-10">
                        <center><div class="small" style="padding-left:18%">L'image a été redimensionée pour l'affichage.
                            <br/><img src="data:image/png;base64,<?php echo $img; ?>">
                            <br/>
                            <a id="link" href="data:image/jpeg;base64,<?php echo $img; ?>" download="fractale.png"><i class="fa fa-floppy-o"></i> Télécharger l'image</a>
                        </center></div>
                    </div>
                </div>
            </div>
        </div>
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
    </body>
</html>
 
