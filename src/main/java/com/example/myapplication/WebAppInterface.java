package com.example.myapplication;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class WebAppInterface {
    private SharedPreferences pref;
    private SharedPreferences.Editor editor;

    private Context context;

    public WebAppInterface(Context context){
        this.context = context;
    }

    public WebAppInterface(Context context, SharedPreferences pref, SharedPreferences.Editor editor) {
        this.pref = pref;
        this.editor = editor;
        this.context = context;
    }

    @JavascriptInterface
    public void showToast(String message){
//        System.out.print(message);
        Toast.makeText(context, message, Toast.LENGTH_LONG).show();
    }

   @JavascriptInterface
    public String getData(String key) {
      return pref.getString(key,"null");
   }
    @JavascriptInterface
    public void delData(String key){
        editor.remove(key);
        editor.apply();
    }

   @JavascriptInterface
    public void putData(String key, String value){
        System.out.println(key);
       editor.putString(key,value);
       editor.apply();
    }

    public void setPref(SharedPreferences pref) {
        this.pref = pref;
    }

    public void setEditor(SharedPreferences.Editor editor) {
        this.editor = editor;
    }
}
