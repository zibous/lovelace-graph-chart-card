# Lovelace - graph-chartjs-card

All files for the home-assistant

Copy all files into your `config/www/community/chart-card` directory.

Add a reference to `chart-card-min.js` inside your `ui-lovelace.yaml` or at the top of the *raw config editor UI*:


```yaml
    resources:
      - url: /hacsfiles/chart-card/chart-card-min.js
        type: module
 ```