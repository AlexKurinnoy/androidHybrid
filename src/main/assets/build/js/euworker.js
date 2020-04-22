let URL_CAS_CERTIFICATES = '/data/CACertificates.p7b';
let URL_XML_HTTP_PROXY_SERVICE = '/proxy_handler';
// let URL_XML_HTTP_PROXY_SERVICE = '/ProxyHandler';
let euSign;
//let s_loaded = false;
console.log(URL_XML_HTTP_PROXY_SERVICE);
self.EUSignCPModuleInitialized = EUSignCPModuleInitialized;


// importScripts(
//   'lib/euscpt.js',
//   'lib/euscpm.js',
//   'lib/euscp.js');




onmessage = function(msg) {

  //console.log( 'Here in worker filelib ' );
  const {id, payload} = msg.data;
  const {command, data} = payload;

  switch( command ) {
    case 'init':
      init().then(res => {

        self.postMessage( {id, err:null, payload:'ok'} );
      }).catch(err => {
        console.log('init reject in worker');
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'setCA':
      setCA( data ).then(res => {
        //console.log('init resolve in worker');
        self.postMessage( {id, err:null, payload:'ok'} );
      }).catch(err => {
        //console.log('init reject in worker');
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'readKey':
      readKey( data ).then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'addCerts':
      console.log('addCerts запущен');
      addCerts( data ).then(res => {
        self.postMessage( {id, err:null, payload:res} );
        console.log('addCerts ОТРАБОТАЛ');
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'checkCert':
      checkCert().then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'signDataInternal':
      signDataInternal( data ).then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        console.log(err);
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'signData':
      signData( data ).then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'protectData':
      protectData( data ).then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'unprotectData':
      unprotectData( data ).then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'encryptData':
      encryptData( data ).then(res => {
        // console.log('init resolve in worker' + id);
        console.log('init resolve in worker' + res);
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        console.log('errr init resolve in worker' + id);
        console.log('err=' + err);
        // self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'decryptData':
      decryptData( data ).then(res => {
        console.log('start decryptData' + res);
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        console.log('errr decryptData' + err);
      });
      break;
    case 'resetKey':
      resetKey().then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
    case 'checkKey':
      checkKey().then(res => {
        self.postMessage( {id, err:null, payload:res} );
      }).catch(err => {
        self.postMessage( {id, err:err, payload:null} );
      });
      break;
  } // switch( command )

};


function init() {
  return new Promise(function(resolve, reject) {
    console.log('INIT ОТРАБОТАД');
    try {
      euSign.Initialize();
      euSign.SetJavaStringCompliant(true);
      euSign.SetCharset('UTF-8');

      setSettings().then(res => {
        console.log('setSettings ОТРАБОТАД');
        loadCACerts().then(res => {
          console.log('loadCACerts ЗАПУЩЕН');
          resolve( res );
        }).catch(err => {
          console.log( 'Certificate loading error: '+err );
          reject( err );
        });

        //resolve( res );
      }).catch(err => {
        console.log( 'Settings set error: '+err );
        reject( err );
      });

      //resolve( 'Ok' );
    } catch (e) {
      console.log( e );
      reject ( e.message );
    }
  }); // new Promise
}


function setSettings(onSuccess, onError) {
  return new Promise((resolve, reject) => {
    try {
      euSign.SetXMLHTTPProxyService( URL_XML_HTTP_PROXY_SERVICE );

      var settings = euSign.CreateFileStoreSettings();
      settings.SetPath( '' );
      settings.SetSaveLoadedCerts( true );
      euSign.SetFileStoreSettings( settings );

      settings = euSign.CreateProxySettings();
      euSign.SetProxySettings( settings );

      settings = euSign.CreateTSPSettings();
      euSign.SetTSPSettings( settings );

      settings = euSign.CreateOCSPSettings();
      settings.SetUseOCSP( true );
      settings.SetBeforeStore( true );
      settings.SetAddress( '' );
      settings.SetPort( 80 );
      euSign.SetOCSPSettings( settings );

      settings = euSign.CreateCMPSettings();
      euSign.SetCMPSettings( settings );

      settings = euSign.CreateLDAPSettings();
      euSign.SetLDAPSettings( settings );

      settings = euSign.CreateModeSettings();
      settings.offlineMode = true;
      euSign.SetModeSettings(settings);

      resolve( 'Ok' );

    } catch (e) {
      console.log( e );
      reject( e.message );
    }

  }); // new Promise
}


function loadCACerts() {
  return new Promise((resolve, reject) => {

    let _onSuccess = function(certificates) {
      try {
        euSign.SaveCertificates(certificates);
        resolve( 'Ok' );
      } catch (e) {
        console.log( e );
        reject( e );
      }
    };
    let _onError = function(e) {
      reject( 'Виникла помилка при завантаженні сертифікатів з сервера. ' +
        '(HTTP статус ' + e + ')' );
    };

    euSign.LoadDataFromServer(URL_CAS_CERTIFICATES,
      _onSuccess, _onError, true);
    console.log('URL_CAS_CERTIFICATES задействованы');
  }); // new Promise
}

function setCA( caServer ) {
  //console.log( 'worker crypto set CA' );

  return new Promise(function(resolve, reject) {

    let offline;

    if( caServer === null || caServer.address === '') {
      offline = true;
    }

    try {
      let useCMP = (!offline && (caServer.cmpAddress !== ''));
      let settings;

      settings = euSign.CreateTSPSettings();
      if (!offline) {
        settings.SetGetStamps(true);
        if (caServer.tspAddress !== '') {
          settings.SetAddress(caServer.tspAddress);
          settings.SetPort(caServer.tspAddressPort);
        } else {
          settings.SetAddress('acskidd.gov.ua');
          settings.SetPort('80');
        }
      }
      euSign.SetTSPSettings(settings);

      settings = euSign.CreateOCSPSettings();
      if (!offline) {
        settings.SetUseOCSP(true);
        settings.SetBeforeStore(true);
        settings.SetAddress(caServer.ocspAccessPointAddress);
        settings.SetPort(caServer.ocspAccessPointPort);
      }

      euSign.SetOCSPSettings(settings);

      settings = euSign.CreateCMPSettings();
      settings.SetUseCMP(useCMP);
      if (useCMP) {
        settings.SetAddress(caServer.cmpAddress);
        settings.SetPort('80');
      }
      euSign.SetCMPSettings(settings);

      settings = euSign.CreateLDAPSettings();
      euSign.SetLDAPSettings(settings);

      resolve( true );

    } catch (e) {
      console.log( e );
      reject( e );
    }

  }); // new Promise
}


function readKey( data ) {
  return new Promise((resolve, reject) => {
    try {
      let {key, pass} = data;
      console.log('psw='+pass);
      euSign.ReadPrivateKeyBinary(key, pass);
      resolve( 'Ok' );
    } catch(e) {
      console.log( e );
      reject( {code:e.errorCode, message:e.message} );
    }
  });
}


function addCerts( data ) {
  return new Promise((resolve, reject) => {

    try {
      let onSuccess = function() {
        return;
      };
      let onError = function(e) {
        console.log( e );
        reject( e );
      };

      if (Array.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          euSign.SaveCertificate(data[i], onSuccess, onError);
        } // for (var i = 0; i < localCerts.length; i++)
      }
      resolve( true );
    } catch (e) {
      console.log( e );
      reject( e );
    }

  }); // new Promise
}


function checkCert() {
  return new Promise((resolve, reject) => {

    let cert = euSign.EnumOwnCertificates( 0 );
    let certOk = false;
    let i = 1;
    while(cert !== null) {

      if(cert.GetKeyUsageType() === 3) {
        certOk = true;
        break;
      }

      cert = euSign.EnumOwnCertificates( i );
      i++;
    }

    if( certOk ) {
      resolve( true );
    } else { // if( certOk )
      reject( err );
    } // if( certOk ) ... else

  }); // new Promise
}


function signData( data ) {
  return new Promise((resolve, reject) => {

    try {
      console.log(data);

      let res = euSign.SignData(data, true);
      resolve( res );
    } catch( e ) {
      console.log(e);
      reject( e );
    }

  }); // new Promise
}

function signDataInternal( data ) {
  console.log('signDataInternal' + data);
  return new Promise((resolve, reject) => {

    try {
      let res = euSign.SignDataInternal(true, data, true);
      console.log('signDataInternal' + res);
      resolve( res );
    } catch( e ) {
      reject( e );
    }

  }); // new Promise
}

function protectData( data ) {
  return new Promise((resolve, reject) => {
    let {buf, pass} = data;
    try {
      let res = euSign.ProtectDataByPassword(buf, pass, true);
      resolve( res );
    } catch( e ) {
      reject( e );
    }

  }); // new Promise
}


function unprotectData( data ) {
  return new Promise((resolve, reject) => {
    let {buf, pass} = data;
    try {
      let res = euSign.UnprotectDataByPassword(buf, pass, false);
      resolve( res );
    } catch( e ) {
      reject( e );
    }
  }); // new Promise
}


function resetKey() {
  return new Promise((resolve, reject) => {

    try {
      euSign.ResetPrivateKey();
      resolve( true );
    } catch( e ) {
      reject( e );
    }

  }); // new Promise
}

function encryptData( data ) {
  return new Promise((resolve, reject) => {
    let {buf, cert} = data;
    try {
      console.log('euSign = ' +euSign);
      // console.log('cert = ' +[cert]);
      let res = euSign.EnvelopDataToRecipientsWithDynamicKey([cert], true, true, buf, true);
      console.log('EnvelopDataToRecipientsWithDynamicKey ok');
      resolve( res );
    } catch( e ) {
      e.pri;
      reject( e );
    }

  }); // new Promise
}

function decryptData( data ) {
  return new Promise((resolve, reject) => {
    try {
      let res = euSign.DevelopData(data);
      console.log('DevelopData ok');
      resolve( res );
    } catch( e ) {
      console.log(e);
      reject( e );
    }
  }); // new Promise
}

function checkKey() {
  return new Promise((resolve, reject) => {

    try {
      let res = euSign.IsPrivateKeyReaded();
      resolve( res );
    } catch( e ) {
      reject( e );
    }

  }); // new Promise
}

function EUSignCPModuleInitialized(isInitialized) {
    // Эту функцию вызывает библиотека по окончании загрузки
    // Здесь отсылаем первое сообщение в объект fileWrapper, чтобы начать
    // процедуру иниациализации
    console.log('Library initialization callback called');
    s_loaded = isInitialized;
    self.postMessage( 'Ok' );
}
euSign = EUSignCP();



