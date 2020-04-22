package com.example.myapplication;

import android.content.Context;
import android.database.CharArrayBuffer;
import android.webkit.JavascriptInterface;
import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;

import com.android.volley.toolbox.RequestFuture;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;


import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.Array;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.concurrent.ExecutionException;

public class WebRESTInterface {
    public String url;
    private Context context;
    final Object lock = new Object();
    static String ResponseStatic=null;
    public WebRESTInterface(String url, Context context) {
        this.url = url;
        this.context = context;
    }

    @JavascriptInterface
    public String sendGetX(String url) throws JSONException {

        RequestQueue queue = Volley.newRequestQueue(this.context);
        RequestFuture<String> future =  RequestFuture.newFuture();
            StringRequest stringRequest = new StringRequest(Request.Method.GET, url, future, future);
        queue.add(stringRequest);
        try {
            String result = future.get();
            String newStr = URLDecoder.decode(URLEncoder.encode(result, "iso8859-1"),"UTF-8");
            return newStr;
        }catch (Exception e){
            System.out.println("bed request");
            //callback for  send e.toString();
            JSONObject err =  new JSONObject();
            err.put("err", "Error");
            err.put("errTrue", e.toString());
            return err.toString();
        }
    }

    @JavascriptInterface
    public String sendGet(String url) throws JSONException {

        RequestQueue queue = Volley.newRequestQueue(this.context);
        RequestFuture<String> future =  RequestFuture.newFuture();
        StringRequest stringRequest = new StringRequest(Request.Method.GET, url, future, future);
        queue.add(stringRequest);
        try {
            String result = future.get();
            System.out.println("gud request");
            return result;
        }catch (Exception e){
            System.out.println("bed request");
            //callback for  send e.toString();
            JSONObject err =  new JSONObject();
            err.put("err", "Error");
            err.put("errTrue", e.toString());
            return err.toString();
        }
    }

    @JavascriptInterface
    public String sendPost(String url, final String x) throws ExecutionException, InterruptedException, JSONException {

        RequestQueue queue = Volley.newRequestQueue(this.context);
        RequestFuture<String> future =  RequestFuture.newFuture();
        StringRequest MyStringRequest = new StringRequest (Request.Method.POST, url, future, future)
        {
            @Override
            public String getBodyContentType() {   return "application/json; charset=utf-8";      }

            @Override
            public byte[] getBody() throws AuthFailureError {
                try {
                    return x.getBytes("utf-8");
                } catch (UnsupportedEncodingException uee) {
                    VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", x, "utf-8");
                    return null;
                }
            }
        };

        queue.add(MyStringRequest);
        try {
            String result = future.get();
            return result;
        }catch (Exception e){
            //callback for  send e.toString();
            JSONObject err =  new JSONObject();
            err.put("err", "Error");
            err.put("errTrue", e.toString());
            return err.toString();
        }

    }
//    @JavascriptInterface
//    public void sendGet(String url){
//
//        RequestQueue queue = Volley.newRequestQueue(this.context);
//        StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
//                new Response.Listener<String>() { мы ж там поменяли фанку где
//                    @Override
//                    public void onResponse(String response) {
//                        // Display the first 500 characters of the response string.
//                        System.out.println("Response is: "+ response);
//                    }
//                }, new Response.ErrorListener() {
//            @Override
//            public void onErrorResponse(VolleyError error) {
//                System.out.println("That didn't work!");
//            }
//        });
//        queue.add(stringRequest);
//    }




//    @JavascriptInterface
//    public String sendPost(String url, final String x) {
//
//        RequestQueue queue = Volley.newRequestQueue(this.context);
//        StringRequest MyStringRequest = new StringRequest (Request.Method.POST, url, new Response.Listener<String>() {
//            @Override
//            public void onResponse(String response) {
//                System.out.println("Response is: "+ response);
//
//                synchronized (lock){
//                    ResponseStatic = response;
//                    lock.notify();
//                }
//            }
//        }, new Response.ErrorListener() { //Create an error listener to handle errors appropriately.
//            @Override
//            public void onErrorResponse(VolleyError error) {
//                System.out.println("Response is err: "+ error);
//            }
//        })
//        {
//            @Override
//            public String getBodyContentType() {   return "application/json; charset=utf-8";      }
//
//            @Override
//            public byte[] getBody() throws AuthFailureError {
//                try {
//                    return x.getBytes("utf-8");
//                } catch (UnsupportedEncodingException uee) {
//                    VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", x, "utf-8");
//                    return null;
//                } да походу не отрабатывает да
//            }
//        };
//        queue.add(MyStringRequest);
//
//        try {
//            synchronized(lock) {
//                    lock.wait();
//            }
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//         return ResponseStatic;
//    }

}

