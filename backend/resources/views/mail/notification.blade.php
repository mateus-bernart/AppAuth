<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>This is your code.</title>
</head>
<body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;padding:0;margin:0">
  <div style="width:100%;height:100%;background-color:#F6F6F6">
    <div style="width: 600px; margin: 0 auto;">

      <div style="padding:20px;background-color:#60b565;display: flex;flex-direction: row;">
        <div>
          <img style="display:block;width:140px;padding: 10px;" src="https://statics.coperdia.com.br/curriculos/img/logo-coperdia-large.png" alt="">
        </div>
        <div style="flex-grow: 1; flex-shrink: 1; padding: 10px; padding-left: 30px;text-align: right;">
          <span style="color:#FFFFFF;font-size:18px;">
            <strong>Test System name</strong>
            <br>
            <span style="font-size:15px;line-height:24px;">{{$user_name}}</span>
            <br>
            <span style="font-size:15px;line-height:24px;">{{date('d/m/Y')}}</span>
          </span>
        </div>
      </div>

      <div style="padding:20px;background-color:#FFFFFF;">
        <span style="font-size: 16px;color: #333333;"><strong>Your Code:</strong></span>
        <br>
        <br>
        <span style="font-size: 14px;color: #333333;">{{$otp}}</span>
      </div>
    </div>
  </div>
</body>

</html>