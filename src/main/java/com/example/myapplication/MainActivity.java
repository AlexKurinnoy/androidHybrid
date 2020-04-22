package com.example.myapplication;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Bundle;


import android.util.Base64;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.example.myapplication.helpers.InsecureHostnameVerifier;
import com.example.myapplication.helpers.InsecureTrustManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {
    public static final int REQUEST_EXTERNAL_STORAGE = 1;
    private final static int FILECHOOSER_RESULTCODE = 10;
    File file1 = null;
    private Uri uri;
    private WebView myWebView;
    private ValueCallback<Uri> mUploadMessage;
    private ValueCallback<Uri[]> cb;
    private SharedPreferences pref;
    private SharedPreferences.Editor editor;
    public String url;

    public class GeoWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            // When user clicks a hyperlink, load in the existing WebView
            Uri url = request.getUrl();
            view.loadUrl(String.valueOf(url));
            System.out.println("GEO");
            return true;
        }
    }

    /**
     * WebChromeClient subclass handles UI-related calls
     * Note: think chrome as in decoration, not the Chrome browser
     */
    public class GeoWebChromeClient extends WebChromeClient {
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin,
                                                       GeolocationPermissions.Callback callback) {
            // Always grant permission since the app itself requires location
            // permission and the user has therefore already granted it

            callback.invoke(origin, true, false);
        }
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getSupportActionBar().hide();
        pref = getPreferences(MODE_PRIVATE);
        editor = pref.edit();
//        byte[] certificatesServersForCryptBytes = new byte[0];
//        try {euscp
//            certificatesServersForCryptBytes = Files.readAllBytes(Paths.get("file:///android_asset/html/Public_cert_for_encr_dev.cer"));
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

//        JSONObject json= new JSONObject();
//        try {
//            json.put("FILE_PUBLIC_CERTIFICATE", Arrays.toString(certificatesServersForCryptBytes));
//        } catch (JSONException e) {
//            e.printStackTrace();
//        }
//        System.out.println(json);


        if (verifyStoragePermissions(this)) {
            setMyWebView();
        }

    }


    public void setMyWebView() {
        myWebView = findViewById(R.id.webView);
        myWebView.getSettings().setJavaScriptEnabled(true);
        myWebView.getSettings().setDomStorageEnabled(true);

        myWebView.getSettings().setDefaultTextEncodingName("utf-8");
        myWebView.getSettings().setSupportZoom(true);

        myWebView.getSettings().setLoadWithOverviewMode(true);
        myWebView.getSettings().setUseWideViewPort(true);
        myWebView.getSettings().setBuiltInZoomControls(true);

        myWebView.getSettings().setAllowFileAccessFromFileURLs(true);
        myWebView.getSettings().setAllowUniversalAccessFromFileURLs(true);

        myWebView.getSettings().setDisplayZoomControls(false);
        myWebView.getSettings().setAllowFileAccess(true);
        myWebView.addJavascriptInterface(new WebAppInterface(this, pref, editor), "nativeStorage");
        myWebView.addJavascriptInterface(new WebRESTInterface(url, this), "nativeRequest");
        myWebView.addJavascriptInterface(new WebGeoLocation(this), "nativeLocation");
        myWebView.setWebViewClient(new WebViewClient());


    //        WebGeoLocation geo = new WebGeoLocation(this);
    //
    //        Location stri = geo.getLocation();
    //        System.out.println(stri);

        myWebView.setWebViewClient(new GeoWebViewClient());
        myWebView.getSettings().setGeolocationEnabled(true);
        myWebView.setWebChromeClient(new GeoWebChromeClient());

//      myWebView.loadUrl("https://census.cf");
        myWebView.loadUrl("file:///android_asset/build/index.html");
//        myWebView.loadDataWithBaseURL(null, "file:///android_asset/build/index.html", "text/html", "utf-8", null);
//        myWebView.loadData("file:///android_asset/build/index.html", "text/html", "UTF-8");
//      myWebView.loadUrl("file:///android_asset/tren.html");


//        WebSettings webSettings = myWebView.getSettings();
//        myWebView.getSettings().setAppCachePath( Environment.getDataDirectory() + "/cache");
//        myWebView.getSettings().setAppCacheEnabled(true);
//        myWebView.getSettings().setCacheMode( myWebView.getSettings().LOAD_CACHE_ELSE_NETWORK );
//        myWebView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK );
//        myWebView.getSettings().setCacheMode( WebSettings.LOAD_CACHE_ONLY);
//        myWebView.getSettings().setCacheMode(isNetworkConnected()?WebSettings.LOAD_NO_CACHE: WebSettings.LOAD_CACHE_ONLY); версия так себе

        myWebView.setWebChromeClient(new WebChromeClient() {

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                System.out.println("THIS!!!!!");
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                cb = filePathCallback;
                MainActivity.this.startActivityForResult(Intent.createChooser(i, "File Chooser"), FILECHOOSER_RESULTCODE);

                return true;
            }

        });
        myWebView.invalidate();


    }

    public boolean verifyStoragePermissions(Activity activity) {
        String[] PERMISSIONS_STORAGE = {
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
        };
        // Check if we have write permission 
        int permission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE);

        if (permission != PackageManager.PERMISSION_GRANTED) {
            // We don't have permission so prompt the user
            requestPermissions(
                    PERMISSIONS_STORAGE,
                    REQUEST_EXTERNAL_STORAGE
            );
            return false;
        } else return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == REQUEST_EXTERNAL_STORAGE) {
            // If request is cancelled, the result arrays are empty.
            if (grantResults.length > 0
                    && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            } else {
                Toast.makeText(this, "Permission denied to read your External storage", Toast.LENGTH_SHORT).show();
            }
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        cb.onReceiveValue(new Uri[]{data.getData()});
        super.onActivityResult(requestCode, resultCode, data);
    }
    @SuppressLint("MissingPermission")
    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        return cm.getActiveNetworkInfo() != null;
    }
}

// ты тут?+ так смотри в консоль сейчас я запущу зафиксуваты координаты