# 組み込み・マイコン開発

NagiScript での組み込みシステム開発を学びます。

---

## 概要

NagiScript は以下の特性により、組み込み開発に適しています：

- **軽量ランタイム**: libc のみに依存
- **C ABI 互換**: 既存の C ライブラリをそのまま利用可能
- **Unsafe ブロック**: 低レベルなハードウェア操作をサポート
- **静的型付け**: 実行時エラーを排除

---

## 対応プラットフォーム（準備中）

| プラットフォーム | 状態 | 用途 |
|-----------------|------|------|
| ARM Cortex-M | 🔶 準備中 | STM32, nRF52, etc. |
| RISC-V | 🔶 準備中 | ESP32-C3, etc. |
| x86 ベアメタル | 🔶 準備中 | UEFI, etc. |

---

## 基本的な LED 点滅

### C言語との連携

```ngs
// ハードウェア定義（C言語で記述）
extern fn gpio_init(pin: i32) void
extern fn gpio_set(pin: i32, state: bool) void
extern fn delay(ms: i32) void

// NagiScript での利用
fn blink_led(pin: i32, count: i32) void {
    gpio_init(pin)
    
    var i = 0
    while i < count {
        gpio_set(pin, true)
        delay(500)
        
        gpio_set(pin, false)
        delay(500)
        
        i += 1
    }
}

fn main() void {
    blink_led(13, 10)  // ピン 13 の LED を 10 回点滅
}
```

---

## GPIO 操作

### ピン定義

```ngs
struct GpioPin {
    pin: i32
    mode: GpioMode
}

enum GpioMode {
    Input
    Output
    Alternate
}

fn GpioPin.init(self: GpioPin, mode: GpioMode) void {
    self.mode = mode
    gpio_init(self.pin)
}

fn GpioPin.write(self: GpioPin, state: bool) void {
    gpio_set(self.pin, state)
}

fn GpioPin.read(self: GpioPin) bool {
    gpio_read(self.pin)
}
```

---

## センサー読み取り

### 温度センサーの例

```ngs
extern fn adc_read(channel: i32) i32
extern fn delay(ms: i32) void

fn read_temperature(sensor_pin: i32) f64 {
    val raw = adc_read(sensor_pin)
    // 10 ビット ADC の場合
    val voltage = (raw as f64) * 3.3 / 1023.0
    // TMP36 センサーの場合
    val temperature = (voltage - 0.5) * 100.0
    temperature
}

fn main() void {
    loop {
        val temp = read_temperature(0)
        io.println("Temperature: " + str(temp) + " C")
        delay(1000)
    }
}
```

---

## UART 通信

```ngs
extern fn uart_init(baud_rate: i32) void
extern fn uart_send(data: *const u8, len: i32) void
extern fn uart_receive(buffer: *mut u8, len: i32) i32

fn send_message(msg: str) void {
    unsafe {
        uart_send(msg.as_ptr(), msg.len())
    }
}

fn receive_message(buffer_size: i32) str {
    var buffer = alloc<u8>(buffer_size)
    val len = uart_receive(buffer, buffer_size)
    
    if len > 0 {
        val result = str::from_utf8(buffer, len)
        free(buffer)
        result
    } else {
        free(buffer)
        ""
    }
}
```

---

## I2C デバイス

```ngs
extern fn i2c_init(sda: i32, scl: i32, freq: i32) void
extern fn i2c_write(addr: u8, data: *const u8, len: i32) void
extern fn i2c_read(addr: u8, buffer: *mut u8, len: i32) void

struct I2cDevice {
    addr: u8
}

fn I2cDevice.write(self: I2cDevice, data: u8) void {
    i2c_write(self.addr, &data, 1)
}

fn I2cDevice.read(self: I2cDevice) u8 {
    var buffer: u8 = 0
    i2c_read(self.addr, &buffer, 1)
    buffer
}
```

---

## SPI 通信

```ngs
extern fn spi_init(mosi: i32, miso: i32, sck: i32, cs: i32) void
extern fn spi_transfer(data: u8) u8

fn spi_write(buffer: *const u8, len: i32) void {
    var i = 0
    while i < len {
        unsafe {
            spi_transfer(*buffer.offset(i))
        }
        i += 1
    }
}
```

---

## 割り込み

```ngs
extern fn interrupt_enable(irq: i32, handler: fn() void) void
extern fn interrupt_disable(irq: i32) void

fn button_handler() void {
    io.println("Button pressed!")
}

fn setup_interrupts() void {
    interrupt_enable(10, button_handler)  // IRQ 10
}

fn main() void {
    setup_interrupts()
    
    loop {
        // メインループ
        delay(100)
    }
}
```

---

## パワーマネジメント

```ngs
extern fn sleep_enter() void
extern fn sleep_exit() void
extern fn deep_sleep(ms: i32) void

fn low_power_mode() void {
    sleep_enter()
    // 低消費電力モード
    sleep_exit()
}

fn power_save(seconds: i32) void {
    deep_sleep(seconds * 1000)
}
```

---

## 実践的な例: IoT センサーノード

```ngs
import "std:io"

extern fn gpio_init(pin: i32) void
extern fn gpio_set(pin: i32, state: bool) void
extern fn adc_read(channel: i32) i32
extern fn uart_init(baud_rate: i32) void
extern fn uart_send(data: *const u8, len: i32) void
extern fn delay(ms: i32) void
extern fn deep_sleep(ms: i32) void

struct SensorNode {
    led_pin: i32
    sensor_pin: i32
    uart_baud: i32
}

fn SensorNode.init(self: SensorNode) void {
    gpio_init(self.led_pin)
    uart_init(self.uart_baud)
}

fn SensorNode.read_sensor(self: SensorNode) f64 {
    val raw = adc_read(self.sensor_pin)
    (raw as f64) * 3.3 / 1023.0
}

fn SensorNode.send_data(self: SensorNode, data: str) void {
    gpio_set(self.led_pin, true)
    unsafe {
        uart_send(data.as_ptr(), data.len())
    }
    gpio_set(self.led_pin, false)
}

fn main() void {
    val node = SensorNode {
        led_pin: 13,
        sensor_pin: 0,
        uart_baud: 115200
    }
    
    node.init()
    
    loop {
        val temp = node.read_sensor()
        val msg = "TEMP:" + str(temp)
        
        node.send_data(msg)
        
        // 1 秒間スリープ
        deep_sleep(1000)
    }
}
```

---

## ビルドとフラッシュ

```bash
# アーム Cortex-M の場合
nagiscript build main.ngs --target arm-cortex-m4 -o firmware.bin

# フラッシュ
openocd -f interface/stlink.cfg -f target/stm32f4x.cfg \
    -c "program firmware.bin verify reset exit 0x08000000"
```

---

## 注意事項

1. **スタックサイズ**: 組み込み環境ではスタックが限られる
2. **ヒープ確保**: Rc を使用する場合はヒープサイズに注意
3. **割り込み安全性**: 割り込みハンドラ内でのメモリ確保は避ける
4. **ボルテージ**: ハードウェアの仕様を確認する

---

[次: C言語との相互運用 →](./cinterop.md)
