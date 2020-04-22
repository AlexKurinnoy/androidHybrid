package com.example.myapplication;





        import android.content.Context;
        import android.location.Location;
        import android.location.LocationListener;
        import android.location.LocationManager;
//        import android.support.v7.app.AppCompatActivity;
        import android.os.Bundle;
        import android.webkit.JavascriptInterface;

public class WebGeoLocation implements LocationListener {


    LocationManager locationManager;
    private Context context;
   
    public WebGeoLocation(Context context) {
        this.context = context;
    }



    @JavascriptInterface
    public String getLocation() {
        try {
            locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 5000, 5, this);
            Location location = locationManager.getLastKnownLocation(locationManager.NETWORK_PROVIDER);
            System.out.println(String.format("{\"latitude\": " + location.getLatitude() + ", \"longitude\": " + location.getLongitude() + "}"));
            return String.format("{ \"latitude\": " + location.getLatitude() + ", \"longitude\": " + location.getLongitude() + "}");

        }
        catch(SecurityException e) {
            e.printStackTrace();
            return "Error";

        }

    }


    @Override
    public void onLocationChanged(Location location) {
//        return String.format("Current Location: " + location.getLatitude() + ", " + location.getLongitude());  в настройках андроида нада разрешение на геоданные приложухе
    }

    @Override
    public void onProviderDisabled(String provider) {

    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {

    }

    @Override
    public void onProviderEnabled(String provider) {

    }
}
// из колбека идет ошибка и падает кетч верхний, ну он полюбому должен был  упасть там