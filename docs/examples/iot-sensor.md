# IoT センサーデータ収集

NagiScript で IoT センサーデータを収集するシステムを開発するチュートリアルです。

---

## 概要

このチュートリアルでは、NagiScript で IoT センサーデータを収集し、クラウドに送信するシステムを作成します。

- 温度・湿度センサーの読み取り
- データの保存
- クラウドへの送信

---

## プロジェクト構成

```
iot_sensor/
├── main.ngs
├── sensor.ngs
├── storage.ngs
└── cloud.ngs
```

---

## 実装

### sensor.ngs — センサー操作

```ngs
extern fn adc_read(channel: i32) i32
extern fn gpio_init(pin: i32) void
extern fn gpio_set(pin: i32, state: bool) void
extern fn delay(ms: i32) void

struct TemperatureSensor {
    pin: i32
}

fn TemperatureSensor.read(self: TemperatureSensor) f64 {
    val raw = adc_read(self.pin)
    val voltage = (raw as f64) * 3.3 / 1023.0
    val temperature = (voltage - 0.5) * 100.0
    temperature
}

struct HumiditySensor {
    pin: i32
}

fn HumiditySensor.read(self: HumiditySensor) f64 {
    val raw = adc_read(self.pin)
    val voltage = (raw as f64) * 3.3 / 1023.0
    val humidity = voltage * 100.0 / 3.3
    humidity
}

struct SensorData {
    temperature: f64
    humidity: f64
    timestamp: i64
}
```

### storage.ngs — データ保存

```ngs
import "std:io"
import "std:fs"

fn save_data(data: SensorData, path: str) Result<void, str> {
    val line = str(data.timestamp) + "," + 
               str(data.temperature) + "," + 
               str(data.humidity)
    
    fs.append_to_string(path, line + "\n")
        .map_err(fn(e: str) str { "Failed to save: " + e })
}

fn load_data(path: str) Result<List<SensorData>, str> {
    val content = fs.read_to_string(path)
        .map_err(fn(e: str) str { "Failed to load: " + e })?
    
    var data = List<SensorData> {}
    
    for line in content.split("\n") {
        if line.len() > 0 {
            val parts = line.split(",")
            if parts.len() >= 3 {
                data.add(SensorData {
                    timestamp: atoi(parts[0]),
                    temperature: atof(parts[1]),
                    humidity: atof(parts[2])
                })
            }
        }
    }
    
    Result.Ok(data)
}
```

### cloud.ngs — クラウド送信

```ngs
import "std:http"

struct CloudClient {
    endpoint: str
    api_key: str
}

fn CloudClient.send(self: CloudClient, data: SensorData) Result<void, str> {
    val payload = "{" +
        "\"timestamp\":" + str(data.timestamp) + "," +
        "\"temperature\":" + str(data.temperature) + "," +
        "\"humidity\":" + str(data.humidity) +
        "}"
    
    val response = http.post(self.endpoint, payload)
        .map_err(fn(e: str) str { "Network error: " + e })?
    
    if response.status == 200 {
        Result.Ok(())
    } else {
        Result.Err("Server error: " + str(response.status))
    }
}
```

### main.ngs — メインプログラム

```ngs
import "std:io"
import "std:time"
import "sensor"
import "storage"
import "cloud"

fn main() void {
    val temp_sensor = TemperatureSensor { pin: 0 }
    val hum_sensor = HumiditySensor { pin: 1 }
    val cloud = CloudClient {
        endpoint: "https://api.example.com/sensors",
        api_key: "your-api-key"
    }
    
    io.println("Starting IoT sensor data collection...")
    
    loop {
        val data = SensorData {
            temperature: temp_sensor.read(),
            humidity: hum_sensor.read(),
            timestamp: time.now()
        }
        
        io.println("Temperature: " + str(data.temperature) + " C")
        io.println("Humidity: " + str(data.humidity) + " %")
        
        match save_data(data, "sensor_data.csv") {
            Result.Ok(_) => io.println("Data saved locally"),
            Result.Err(e) => io.println("Save error: " + e)
        }
        
        match cloud.send(data) {
            Result.Ok(_) => io.println("Data sent to cloud"),
            Result.Err(e) => io.println("Cloud error: " + e)
        }
        
        delay(5000)  // 5 秒待機
    }
}
```

---

## 実行例

```bash
nagiscript run main.ngs
```

出力例：
```
Starting IoT sensor data collection...
Temperature: 23.5 C
Humidity: 65.2 %
Data saved locally
Data sent to cloud
Temperature: 23.6 C
Humidity: 65.1 %
Data saved locally
Data sent to cloud
```

---

## 学べること

1. **ハードウェア操作**: GPIO や ADC の使用
2. **データ永続化**: ファイルへのデータ保存
3. **ネットワーク通信**: HTTP によるクラウド送信
4. **ループ処理**: 定期的なデータ収集

---

## トラブルシューティング

### センサーが読めない

```ngs
// デバッグ用
val raw = adc_read(0)
io.println("Raw value: " + str(raw))
```

### クラウド送信が失敗する

```ngs
// ネットワーク接続を確認
val response = http.get("https://api.example.com/health")
match response {
    Result.Ok(res) => io.println("Connected: " + res.body),
    Result.Err(e) => io.println("Connection failed: " + e)
}
```

---

[戻る: ドキュメント一覧 →](../index.md)
