# AIOHub — Tổng kết thử nghiệm, lỗi đã gặp và bài học triển khai

**Mốc tổng hợp:** 13/11/2026, múi giờ Asia/Bangkok.  
**Đối tượng:** người phát triển app, người kiểm thử và agent tiếp tục dự án.  
**Phạm vi:** WKWebView trên iOS Simulator; Android System WebView; GeckoView native; HTML5 games; khởi tạo React Native + GeckoView.

Đây là hồ sơ kỹ thuật của các lần thử nghiệm, kèm đề xuất cho app hoàn chỉnh. Tài liệu không phải chứng nhận hỗ trợ mọi thiết bị/provider, không tự thay đổi các quyết định sản phẩm và không chứng minh toàn bộ chức năng đã có trong app hiện tại.

## Cách đọc và nguồn bằng chứng

- **Đã xác minh:** có kết quả build/test, trace hoặc quan sát runtime trong cấu hình được ghi rõ.
- **Workaround:** giúp tiếp tục thử nghiệm nhưng chưa sửa nguyên nhân gốc.
- **Chưa kết luận:** có triệu chứng/giả thuyết, chưa đủ bằng chứng để gán nguyên nhân hoặc tuyên bố đã sửa.
- **Đề xuất:** hướng triển khai/kiểm thử tiếp theo, chưa đồng nghĩa được chốt hoặc đã xây dựng.

Nguồn được dùng khi tổng hợp:

| Nguồn | Phạm vi và độ tin cậy |
| --- | --- |
| Báo cáo kỹ thuật, verification JSON, kết quả quan sát và source của lab WebView ngày 05/11 | Đã đọc lại tại lần tổng hợp này; bản sao JSON và kết quả không chứa bí mật nằm trong [thư mục bằng chứng](experiment-evidence/). |
| Lịch sử làm việc GeckoView ngày 07–08/11 trong cuộc trao đổi | Ghi nhận kết quả sửa cookie, kiểm thử đăng nhập và game. Các đường dẫn cũ dưới `MobileAssignment1` không còn truy cập được ở lần kiểm kê này; chưa đối chiếu lại được raw log, ảnh và source archive GeckoView cũ. |
| Khởi tạo React Native ngày 13/11 | Đã quan sát build/test và đọc lại cấu hình native. Đây là mốc scaffold, không phải chứng nhận hồi quy cho các thay đổi UI đang phát triển sau đó. |
| Source/tài liệu upstream | Dùng đối chiếu cơ chế cookie, crash emulator và API. Một tài liệu upstream không thay thế kiểm thử app trên thiết bị thật. |

[Xuất xứ và checksum của bằng chứng đã lưu](experiment-evidence/source-provenance.json). Tài liệu không chứa cookie thật, mật khẩu, khóa chuyển phiên, email tài khoản hay full URL xác thực.

## 1. Những kết luận quan trọng nhất

1. **React Native dùng được làm app shell; GeckoView dùng được làm browser engine Android.** Fabric nối UI React Native với view native. Website chạy bằng Gecko, còn JavaScript của app chạy bằng Hermes.
2. **Đã chuyển được trạng thái đăng nhập YouTube trong các môi trường đã thử.** Cả WKWebView, Android System WebView và lab GeckoView đều có kết quả máy đích hiển thị cùng tài khoản mà không đăng nhập Google lại.
3. **Đó là chuyển snapshot có điều kiện, chưa phải đồng bộ đa thiết bị hoàn chỉnh.** Chưa có backend E2EE, device trust, chống replay hay kiểm thử rotation dài hạn.
4. **Cookie không chỉ có name/value.** Host-only, domain/path, prefix, Secure/HttpOnly, SameSite, expiry và partition context quyết định cookie có được chấp nhận và gửi đúng chỗ hay không.
5. **Google sign-in xong chưa đồng nghĩa YouTube đã hoàn thành đăng nhập.** Lỗi return/redirect sau MFA từng xuất hiện trên cả ba engine; không đủ cơ sở quy hết cho một WebView cụ thể.
6. **Không dùng host allowlist cho điều hướng web mặc định**, theo quyết định của người dùng. Quyền đọc/ghi cookie và native bridge vẫn phải có phạm vi riêng.
7. **GeckoView đã chạy được ba HTML5 game được thử.** Những lần đầu trắng/loading chưa đủ chứng minh engine không tương thích; launcher, quảng cáo, thao tác UI và emulator đều ảnh hưởng kết quả.
8. **Đã xác định một crash nằm trong Android Emulator 37.2.13 trên Mac**, không phải lỗi JavaScript game hay bằng chứng GeckoView dùng Chromium.
9. **Bundled engine giúp chủ động engine/API nhưng có chi phí kích thước và bảo trì.** Chưa đo đủ để cam kết “light on data/storage”, ít RAM/pin hoặc hiệu năng máy thật.
10. **Chưa chứng minh Spotify/SoundCloud, background playback, DRM hoặc suppression mọi lời mời mở app.** Có shortcut hoặc tải được trang không phải bằng chứng các tính năng đó hoạt động.

## 2. Các đợt thử nghiệm và kết quả thực tế

### 2.1 WKWebView → WKWebView, ngày 05/11

- Hai iPhone simulator riêng trên cùng Mac/mạng; nguồn iPhone 17 Pro, iOS 26.5. Không phải hai iPhone thật.
- Người dùng tự đăng nhập Google và hoàn thành MFA. Từng bị kẹt ở trang xác minh, sau đó đăng nhập YouTube thành công.
- Máy đích mới được kiểm tra rõ đang đăng xuất trước khi import.
- Chuyển 44 bản ghi cookie và localStorage/sessionStorage của origin YouTube đang mở; file AES-GCM 21.254 byte, khóa xử lý riêng, không upload cloud.
- Máy đích hiển thị cùng tài khoản/lịch sử, video được quan sát ở 0:35 / 8:28, còn đăng nhập sau terminate/relaunch app.
- Chưa đo coverage partition metadata của serializer iOS. Không có lỗi Partitioned không có nghĩa đã chuyển đủ dữ liệu Partitioned.
- Binary iOS đã chạy có trước các sửa Android cuối cùng. iOS JS bundle từ source cuối được export thành công, nhưng native iOS chưa được build/chạy lại để lặp toàn bộ luồng đó.

**Ý nghĩa:** tập dữ liệu đã capture đủ cho các thao tác được quan sát trong cặp simulator này; không chứng minh full-profile portability hoặc độ bền dài hạn.

### 2.2 Android System WebView → System WebView, ngày 05/11

- Hai AVD riêng: Medium Phone API 37.0 và AIOHub Android Destination, Android 17 ARM64; System WebView 145.0.7632.218.
- Máy đích tạo từ cấu hình/system image, không clone userdata hoặc snapshot của nguồn. Baseline đăng xuất được kiểm tra lại sau Studio restart.
- Sau Google login, nguồn từng bị kẹt loading. Quay lại YouTube → Sign in → chọn tài khoản Google đã nhớ giúp hoàn thành đăng nhập YouTube.
- Export đầy đủ ban đầu bị chặn do thiếu partition metadata. Người dùng sau đó chọn phép thử **ordinary cookies only**, có công bố thiếu dữ liệu.
- Export 139 bản ghi thông thường, ghi nhận 25 bản ghi Partitioned bị bỏ qua trong ciphertext; file 66.286 byte.
- Import đầu từ chối ba bản ghi `__Host-`. Sửa chuyển đổi host-only domain rồi import lại cùng file/khóa: toàn bộ 139 bản ghi được chấp nhận.
- Máy đích hiện cùng tài khoản/lịch sử, video chính sau quảng cáo ở 1:01 / 8:28, còn đăng nhập sau force-stop/relaunch app.
- Kết quả cuối ghi nhận 7 test qua, TypeScript qua, Android Release build qua, iOS JS bundle qua.

**Không so 44 với 139 để kết luận Android capture đầy đủ hơn.** Android probe nhiều URL; có thể có các bản ghi cùng cookie logic. Số 25 là bản ghi bị lọc, không phải phần trăm trạng thái đăng nhập bị mất.

### 2.3 GeckoView → GeckoView, hoàn tất ngày 07/11

- Lab Android native Java, app ID `dev.aiohub.geckolab`; engine 159.0.20261102144711; bản sửa kết thúc ở app 0.1.10, versionCode 11.
- Cookie đi qua built-in WebExtension và native messaging; dùng metadata có cấu trúc, bao gồm dữ liệu partition mà bridge của lab hỗ trợ.
- Lỗi restore được xác định ở URL dùng cho API cookie, không phải cần bỏ các thuộc tính bảo mật.
- Sau sửa, export/import mã hóa giữa hai emulator thành công; UI đích hiển thị cùng tài khoản/lịch sử/playlist.
- Quan sát video có khung hình thay đổi. Không đo âm thanh, độ trễ hay tiếp tục chính xác timestamp từ máy nguồn.
- Đăng nhập đích còn sau cold boot không dùng snapshot. Đây là bằng chứng mạnh hơn chỉ khởi động lại app, nhưng chưa thay cho thử nghiệm lâu dài trên điện thoại thật.
- Ghi nhận 11 Node test và 10 JVM test qua; build qua; lint không có error, còn các warning đã tồn tại.
- Cookie restore có backup/rollback trong RAM và readback theo thiết kế lab; không biến cookie + web storage thành một transaction bền vững duy nhất.

**Giới hạn:** khẳng định trên thuộc engine/schema/profile đã thử. Không tự áp dụng cho GeckoView 160, khác engine, khác OS, khác mạng hoặc mọi tài khoản.

### 2.4 HTML5Games/Famobi trên GeckoView, ngày 08/11

| Game | Điều đã quan sát được sau debug | Điều chưa chứng minh |
| --- | --- | --- |
| Element Blocks | Tutorial/board render; Settings phản hồi. Về sau thấy board có block/score trong profile gốc. | Automation chưa chứng minh ổn định thao tác drag/drop; không quy điểm số đó cho agent khi có thể người dùng đã chơi. |
| Bubble Tower 3D | Vào round thật; kéo ngang làm đổi hướng tháp và bố cục bubble nhìn thấy. | Chưa xác minh bắn/scoring hoặc chơi hết vòng. |
| Moto X3M Pool Party | Menu landscape → level 1; giữ throttle khoảng hai giây làm xe chuyển động, timer 00.00 → 06.74, có va chạm/physics. | Không benchmark FPS, không kiểm thử dài hạn hoặc âm thanh đầy đủ. |

Catalog, launcher và game là các bước khác nhau. Qua catalog không chứng minh game đã chạy; qua splash không chứng minh input/gameplay hoạt động.

Đã có bản APK tạm chỉ đổi startup URL thành HTML5Games để thử cùng app/profile. Bản sau cùng được mở lại trên emulator có sẵn và để người dùng tiếp tục. Thao tác đó chỉ xác nhận catalog mở; không phải lặp lại toàn bộ gameplay test.

### 2.5 React Native + GeckoView, ngày 13/11

- Khởi tạo bare React Native 0.88.1, React 19.3.0, TypeScript, Hermes và New Architecture tại `~/AIOHub`.
- Fabric component `AIOBrowser` + Kotlin view manager; GeckoView 160.0.20261104181552. Không dùng một npm wrapper GeckoView không kiểm soát được làm nền móng.
- Chọn một runtime Gecko dùng chung trong process; mỗi browser view quản lý session của nó và đóng session khi view bị bỏ.
- Sửa mismatch SDK/Kotlin trước khi Android APK build thành công.
- TypeScript, ESLint, Jest, Android Metro bundle và ARM64 debug APK đều qua ở mốc scaffold. Jest mock native browser, không kiểm chứng YouTube login.
- Không khởi động emulator cho lần scaffold này. App ID mới `dev.aiohub.app` khác lab cũ; không tự có cookie của lab cũ.
- iOS mới có native shell và thông báo browser chưa hỗ trợ; chưa tích hợp WKWebView/build iOS.

Source hiện tại là nơi xác định phần nào đã triển khai: [Fabric spec](../src/specs/AIOBrowserNativeComponent.ts), [Android browser](../android/app/src/main/java/dev/aiohub/app/browser/BrowserView.kt), [native manager](../android/app/src/main/java/dev/aiohub/app/browser/BrowserViewManager.kt), [dependency manifest](../package.json), [Android build](../android/app/build.gradle). Không lấy trạng thái màn hình demo làm bằng chứng đã migrate session-transfer engine.

## 3. Các lỗi, nguyên nhân, cách sửa và phần còn mở

### B01 — Kẹt sau Google MFA / không return về YouTube

**Triệu chứng:** người dùng đã approve trên Gmail/iPhone nhưng simulator/emulator vẫn ở trang xác minh, loading hoặc trắng. Xuất hiện ở WKWebView, System WebView và GeckoView.

**Điều đã biết:** có trường hợp Google account đã được lưu nhưng YouTube chưa hoàn tất flow của riêng nó. Workaround quay lại YouTube rồi chọn account đã nhớ giúp tiếp tục ở Android System WebView.

**Chưa kết luận:** không có một trace xuyên suốt chứng minh cùng nguyên nhân trên mọi engine. Chưa thể nói MFA polling, popup, cookie, redirect hay engine là nguyên nhân chung. Không gọi workaround này là đã sửa redirect.

**Hướng tiếp tục:** ghi timeline main-frame navigation, load state, quyết định allow/deny, new-window request, app lifecycle và lỗi engine theo mã đã biên tập. Tách ca fresh login + MFA khỏi ca chọn tài khoản đã nhớ. Cần timeout có nút Retry/Back, nhưng không tự điều hướng đi khi MFA vẫn đang chờ người dùng.

### B02 — Android WebView không có đủ partition metadata

**Triệu chứng:** export dừng với `Partitioned cookies require unsupported partition metadata` trước khi tạo file/khóa.

**Nguyên nhân:** header có `Partitioned` không đủ mô tả partition context cần để restore đúng. Đây là giới hạn capability và guard bảo vệ tính đúng, không phải lỗi cần bỏ validation.

**Cách xử lý đã thử:** giữ action export đầy đủ ở trạng thái reject; thêm action ordinary-only riêng sau khi người dùng chọn. Lọc record Partitioned và đưa `omittedPartitionedCookies` vào payload được AEAD xác thực.

**Kiểm chứng:** đích đăng nhập được với phần dữ liệu đã chuyển. Không chứng minh partitioned state không cần cho mọi tính năng/tài khoản.

**Bài học:** không xóa cờ `Partitioned` rồi khôi phục thành cookie thông thường. Sản phẩm phải phân biệt supported, incomplete và unsupported; người dùng thấy rõ giới hạn trước khi thay phiên.

### B03 — Android từ chối ba cookie `__Host-`

**Triệu chứng:** 3/139 record không được native `setCookie` chấp nhận.

**Nguyên nhân đã đối chiếu:** trên Chromium/System WebView 145.0.7632.218, API capture serialize stored domain thành thuộc tính `Domain`, kể cả record host-only. Đưa nguyên header đó vào restore vi phạm điều kiện của prefix `__Host-` khi có `Domain`.

**Cách sửa đã kiểm thử:** với format Android đó, domain lưu không có dấu chấm đầu chỉ được chuyển thành host-only khi nó khớp chính xác host của URL record; khi restore thì bỏ thuộc tính `Domain`. Domain-cookie có dấu chấm được giữ nguyên; mismatch bị từ chối trước khi clear. Không bỏ Secure, HttpOnly, SameSite hoặc sửa path để ép import qua.

**Kiểm chứng:** test hồi quy và import lại cùng file/khóa; 139 record được chấp nhận; UI đúng account; còn đăng nhập sau relaunch.

**Giới hạn quan trọng:** đây là cách đọc metadata của API/version đã đối chiếu, không phải quy tắc tổng quát “domain không có dấu chấm thì mọi engine đều host-only”. Gecko có metadata `hostOnly` thì phải dùng ngữ nghĩa đó. Xem implementation lịch sử `restoreAndroidHostOnlyCookies` trong nguồn lab WebView, được định vị ở cuối tài liệu.

### B04 — GeckoView restore bị từ chối dù cookie không Secure là hợp lệ

**Triệu chứng:** restore qua WebExtension không hoàn tất. Mở thêm export/import không tự giải quyết được.

**Nguyên nhân đã xác minh trong lab:** builder tạo URL `http://…` cho cookie có `secure:false`, nhưng extension chỉ có quyền HTTPS cho các host Google/YouTube. API từ chối URL ngoài phạm vi quyền. Đây là mismatch giữa URL thao tác API và quyền extension.

**Cách sửa:** URL dùng để gọi cookie API luôn dựng bằng HTTPS trên host/path hợp lệ; vẫn giữ nguyên `secure:false` của cookie. HTTPS URL thao tác không đồng nghĩa nâng/chuyển thuộc tính Secure của record.

**Kiểm chứng:** regression red/green cho record không Secure, mở rộng synthetic self-test, Node/JVM test và lần chuyển thật thành công. Bản 0.1.10 là mốc đã qua.

**Không làm:** cấp quyền cookie trên mọi website hoặc ép mọi cookie thành Secure. Quyết định cho phép duyệt mọi website không yêu cầu quyền export mọi website.

### B05 — Allowlist chặn một phần flow Google

**Quan sát trong debug GeckoView:** trace bản 0.1.5 ghi nhận route GDS bị deny; bản 0.1.6 còn gặp flow SetSID qua host Google theo quốc gia. Người dùng sau đó yêu cầu không đặt allowlist và cho phép mọi website mặc định.

**Cách xử lý đã chọn:** bỏ giới hạn host đối với điều hướng HTTP/HTTPS; giữ native/extension privilege scope riêng. Đây là quyết định sản phẩm đã có, không cần tự thêm lại host allowlist khi port app.

**Mức kết luận:** chứng minh allowlist từng là một yếu tố gây chặn. Chưa chứng minh nó là nguyên nhân duy nhất của mọi ca MFA/white screen. Phải lặp fresh sign-in end-to-end sau thay đổi; remembered-account login không thay thế ca đó.

### B06 — New-window/popup handling còn cần kiểm tra

Lab từng xử lý `onNewSession` bằng cách nạp URL vào session hiện tại rồi trả `null`. Đây là điểm cần đối chiếu lại hợp đồng GeckoView khi hoàn thiện window/session ownership.

Không có bằng chứng `NEW_WINDOW` trong flow lỗi đã capture để kết luận nó gây ra B01. Không được sửa hàng loạt cookie/UA chỉ vì nghi popup. Cần tạo ca kiểm thử riêng cho link mở cửa sổ mới, login popup, đóng cửa sổ và callback về tab cha.

Scaffold React Native mới chưa port popup/window handling của lab. Một view load URL được không đồng nghĩa mọi flow đa cửa sổ được hỗ trợ.

### B07 — Android Emulator 37.2.13 crash trong cleanup OpenGL

**Triệu chứng:** process emulator trên Mac thoát exit 139, thường quanh force-stop/reinstall hoặc cleanup process. Người dùng có thể thấy màn hình trắng, emulator biến mất hoặc Running Devices mất kết nối.

**Bằng chứng crash:** `.ips` có `EXC_BAD_ACCESS`, địa chỉ 0x28; stack qua `libgfxstream_backend.dylib`, `EglContext::~EglContext`, `eglDestroyContext`, `cleanupProcGLObjects`, `RendererImpl::ProcessCleanupThread`.

**Đối chiếu upstream:** [Chromium tools/android commit 0d2c759](https://chromium.googlesource.com/chromium/src/tools/android/+/0d2c7590ad90c5e3e5390a1d732ef2b2305d343d) pin emulator về 37.1.11 do 37.2.13 thiếu follow-up null-surface check ở GL cleanup. Báo cáo upstream nói về x86_64; ca Mac ARM64 của chúng ta có stack tương ứng, là bằng chứng độc lập ở môi trường này.

**Workaround đã kiểm thử:** dùng runtime emulator 37.1.11 tải từ archive chính thức, chạy cô lập ngoài SDK đang cài, cùng AVD/profile và GPU software. Catalog → Element board hoạt động; force-stop/restart và force-stop/reinstall không tái crash trong lần quan sát khoảng 7 phút 08 giây; emulator thoát sạch exit 0.

**Giới hạn:** đây là workaround có bằng chứng ngắn hạn, không phải cam kết ổn định mọi ca hoặc bản emulator nên pin vĩnh viễn. SDK emulator toàn máy không bị thay thế. Đường runtime `/private/tmp` chỉ là staging của phép thử, có thể đã bị dọn; muốn tái lập phải kiểm tra artifact rồi chuẩn bị lại.

**Giả thuyết bị bác bỏ:** `-no-audio` không sửa được lỗi; lần chạy có cờ đó vẫn crash cùng đường GL cleanup. Không khuyên dùng 37.2.12 thay thế vì upstream cũng ghi regression rò bộ nhớ ở bản đó.

**Chromium liên quan ở đâu?** Chromium là dự án có bằng chứng về lỗi Android Emulator dùng chung. GeckoView vẫn chạy Gecko; nó không nhúng Chromium vì ta trích dẫn bug này.

### B08 — Emulator watchdog/hang là ca riêng

Một lần khác có QEMU main-loop/CPU watchdog hang rồi dump qua `CrashReporter::GenerateDumpAndDie`/`HangDetector`, exit 139.

Đã nhận diện đây là host emulator failure; nguyên nhân sâu của lần watchdog đó chưa được chứng minh. Không gộp nó với B07 chỉ vì cùng exit code. Cũng không dùng B07 để giải thích mọi blank screen trước đó.

### B09 — Kết luận game không chạy quá sớm

**Lần đầu:** Element chỉ thấy background, Bubble trắng sau quảng cáo, Moto ở loading landscape. Đây là các quan sát thất bại, chưa đủ để xác định lỗi Gecko engine.

**Sau debug:** cùng engine 159 chạy được board/round/physics ở ba game. Launcher nhiều lớp, consent, quảng cáo, thời gian chờ và độ tin cậy thao tác UI làm việc quan sát khó hơn.

**Cách cải thiện phép thử:** tách catalog → launcher → consent/age → ad → game canvas → input → gameplay; có cả đường launcher thực và direct-game để chẩn đoán. Direct-game chỉ hỗ trợ định vị, không thay kết quả của flow người dùng thực tế.

Các log `EGL_BAD_ATTRIBUTE`, WindowEventDispatcher/SessionStore và thiếu ContentPermission listener xuất hiện cả lúc game hoạt động; chưa đủ chứng minh chúng là blocker. Đổi viewport/orientation, request fullscreen và tương tác canvas cần tiêu chí quan sát riêng.

### B10 — Công cụ điều khiển Studio bị nhầm với app bị treo

Đã gặp `windowNotFoundAtPosition`, lỗi chuyển tab Running Devices, tọa độ Retina không khớp ảnh, AX node cũ, modal sign-in của Studio chặn thao tác và cảnh báo System UI không phản hồi.

**Các xử lý có tác dụng theo từng ca:** đưa Studio về màn hình chính/cửa sổ thường, chọn đúng AVD/tab, đóng modal IDE, lấy ảnh/trạng thái mới trước thao tác và dùng tọa độ đúng kích thước ảnh khi AX không tác động. Cảnh báo System UI có lúc cần người dùng chọn Wait trước khi lưu file.

**Bài học:** xác định app, emulator hay công cụ automation đang lỗi trước khi sửa sản phẩm. Sau Studio restart phải xác minh lại serial → tên AVD → package/profile. Không coi emulator-5554/5556 là danh tính bền vững. Clone cấu hình AVD không được vô tình clone userdata khi kiểm chứng transfer.

### B11 — Toolchain của prototype WebView cũ

| Lỗi/giới hạn | Cách đã xử lý | Giới hạn áp dụng |
| --- | --- | --- |
| Gradle 9 xung đột plugin Foojay trong stack Expo/RN cũ | Pin Gradle 8.14.3 cho lab đó. | Không suy rằng Gradle 9 không dùng được với mọi React Native. Scaffold mới build bằng Gradle 9.4.1. |
| Java 25 của IDE không hợp Gradle đã pin | Chọn Java 21 trong môi trường lab. | Chọn JDK theo toolchain cụ thể, không theo phiên bản IDE mới nhất. |
| Studio mở từ GUI không tìm thấy Node | Khôi phục PATH có Homebrew Node cho process Studio. | Terminal có Node không chứng minh IDE GUI có cùng PATH. |
| SDK/NDK thiếu sau build bị gián đoạn | Cài đủ phiên bản đã pin rồi sync/build lại. | Không sửa code auth để chữa lỗi build tool. |
| CocoaPods trên Ruby 2.6 của môi trường cũ | Dùng bộ gem tương thích cài riêng trong workspace; source-based native build chạy được dù discovery tùy chọn có warning `filter_map`. | Không phải hướng ép app mới tiếp tục Ruby/toolchain cũ. |
| GraalVM 21.0.2 từng lỗi `jlink` khi build lab GeckoView | Dùng JBR 21.0.11 đã build thành công. | Cùng major Java không bảo đảm mọi distribution/patch giống nhau. |

Expo Go không nạp module native cookie tùy biến. Prototype trước dùng native build/development setup phù hợp; việc chọn React Native không loại bỏ nhu cầu Xcode/Gradle/Kotlin/Swift.

### B12 — React Native template và GeckoView không khớp SDK/Kotlin

**Lỗi đã thấy ở lần khởi tạo 13/11:**

- GeckoView AAR yêu cầu compile SDK 37.2; template dùng 37.0.
- Dependency Kotlin stdlib có metadata 2.4.0, compiler template chờ 2.2.0. Sau lỗi đó xuất hiện các lỗi phụ như unresolved `lazy`, `apply`, `listOf`.
- AAR khai báo minSdk 26, trong khi template bắt đầu từ 24; yêu cầu tối thiểu được điều chỉnh trước khi hoàn tất build.

**Cách sửa:** compile SDK dùng minor API 2 của API 37; Kotlin Gradle plugin/setting lên 2.4.21; minSdk 26. Giữ target SDK 36 là cấu hình riêng. Build Tools 37.0.0 và SDK Platform 37.2 được Gradle cài qua license đã có.

**Kiểm chứng:** Codegen, native Kotlin/C++, merge manifest và ARM64 debug APK đều build qua. Không dùng skip metadata check hoặc override manifest để bỏ yêu cầu dependency.

**Còn warning:** template dùng AGP 9.2.1/Gradle 9.4.1; AGP báo SDK 37.2 mới hơn phạm vi đã test của nó là 37.0. Build qua không biến tổ hợp này thành được upstream chứng nhận. Chưa che warning; cần kiểm định tổ hợp AGP được hỗ trợ trước release. Phiên bản cấu hình lấy từ [root Gradle](../android/build.gradle) và [app Gradle](../android/app/build.gradle), không đóng băng theo bài viết này.

### B13 — API TypeScript và test harness ở scaffold mới

| Triệu chứng | Nguyên nhân / cách sửa | Bằng chứng |
| --- | --- | --- |
| TypeScript từ chối `StatusBar.backgroundColor` | Prop không còn trong type RN 0.88 đang cài; bỏ prop đó, dùng nền/safe area của app. | Typecheck qua. |
| Không resolve deep import `react-native/Libraries/Utilities/codegenNativeComponent` | Dùng export `codegenNativeComponent` ở top-level `react-native` của phiên bản này. | Typecheck, lint, Codegen và Metro Android bundle qua. |
| Test tìm `Pressable` bằng component type trả về 0 | Identity qua mock/preset không phải hợp đồng cần kiểm tra; test theo accessibility label, URL đích và hành vi trở về Hub. | Test đi qua từng service và back; không hạ kỳ vọng xuống chỉ render không crash. |

Các lỗi này là tích hợp framework/test, không phải bằng chứng YouTube hay Gecko lỗi. Test JS với native view mock không thay thế việc render Fabric view thật trong emulator.

### B14 — Dependency audit vẫn còn cảnh báo

Ở mốc lab WebView 05/11, audit ghi nhận 26 advisories, trong đó hai high nằm trong chuỗi Expo development tooling. Chưa có bằng chứng hai high đó đều khai thác được trong runtime APK.

Ở mốc scaffold 13/11, audit ghi nhận 15 findings (9 low, 6 moderate) thuộc CLI/test/lint tooling. `npm audit --omit=dev` vẫn tính bốn low trong CLI/deepmerge do phân loại dependency/peer của npm; không suy từ tên lệnh đó rằng mọi finding là code chạy trong APK. `npm audit fix` không giải quyết hết; không dùng `--force` để kéo CLI/Jest về major không tương thích hoặc thêm override chưa kiểm chứng chỉ để số audit về 0.

Đây là snapshot audit của các mốc đã thử, không phải audit mới của toàn bộ dependency đang được thêm khi port UI. App hoàn chỉnh cần rà lại dependency graph, khả năng tiếp cận của mã lỗi và bản vá tương thích; không bỏ qua finding cũng không đánh đồng số lượng advisories với mức khai thác runtime.

## 4. Bài học về browser engine và React Native

### 4.1 Đúng ranh giới trách nhiệm

| Khối | Điều cần giữ khi làm app hoàn chỉnh |
| --- | --- |
| React Native | UI app, điều hướng, tài khoản AIOHub, thiết bị, thông báo lỗi và các dữ liệu app sở hữu. |
| Native browser/profile manager | Runtime, session/view lifecycle, native navigation/window/fullscreen, chọn đúng store/profile. |
| Provider integration | Kiểm chứng login/playback/capture/restore riêng theo website; không suy YouTube thành Spotify. |
| Snapshot/transfer | Metadata, version, capability, validate, mã hóa và trạng thái restore/verify. |
| Device trust/backend | Quyền thiết bị nhận, pairing, key lifecycle, TTL/replay, chuyển ciphertext. Chưa có trong prototype. |

Đổi user agent chỉ đổi nhận dạng request, không đổi engine, không tạo cookie của Chrome/Safari và không bảo đảm Google chấp nhận đăng nhập. Custom Tabs hay system auth session là một đường xác thực khác; không giả định chúng cho app xuất cookie browser hoặc tự đăng nhập embedded engine.

GeckoView là lựa chọn Android. App iOS cần đường WebKit/native phù hợp và kiểm thử riêng. Không có bằng chứng cho Gecko ↔ WKWebView hoặc Gecko ↔ Chromium session portability. Schema và engine phải có capability check; không đưa file của lab này vào lab khác vì cùng đuôi JSON.

### 4.2 Đừng đánh đồng “một app” với “một profile toàn cục”

Lab WebView dùng default store. Clear ở đó có thể xóa mọi cookie/WebStorage của app; không phù hợp bê nguyên sang nhiều provider hoặc nhiều chủ AIOHub.

Đề xuất cần thiết kế: ownership theo tài khoản AIOHub và nhóm provider, trong đó Google/YouTube có thể cần dùng chung một nhóm để hoàn thành login. Nhiều React component không chứng minh store đã tách. Exporter, importer và browser phải cùng trỏ tới profile được định danh.

Scaffold Gecko hiện mới có runtime dùng chung và session theo view; **chưa có profile isolation theo chủ AIOHub/provider**. Đóng browser view không đồng nghĩa xóa phiên provider. Không để thao tác “clear thử nghiệm” trở thành nút xóa dữ liệu không có phạm vi.

### 4.3 Chi phí của bundled engine

System WebView và GeckoView có mô hình phân phối khác nhau. Bundled GeckoView đem engine vào app, nên cần theo dõi cập nhật/bản vá và kích thước theo ABI.

Artifact lab GeckoView lịch sử khoảng 209 MB; scaffold React Native ARM64 debug đã tạo APK khoảng 226 MiB. Đây là artifact với build/dependency khác nhau, không phải benchmark công bằng với APK WebView Release khoảng 24,7 MB. Kích thước APK cũng không bằng dung lượng cài đặt hoặc data tiêu thụ.

Chưa có đo lường đủ về cold start, RAM, pin, data, cache hay số session đồng thời. Mục tiêu “nhẹ” cần budget sản phẩm và phép đo trên máy thật; không tự suy từ việc dùng wrapper hoặc từ một game chạy được.

## 5. Bài học về cookie, storage và encrypted transfer

### 5.1 Ba lớp đăng nhập phải tách biệt

1. **AIOHub identity:** ai được dùng tài nguyên AIOHub.
2. **Provider web session:** Google/YouTube/Spotify xác nhận browser đang đăng nhập ai.
3. **OAuth/API authorization:** app được phép gọi API nào, theo scope nào.

Đăng nhập AIOHub không tự tạo phiên YouTube. OAuth access token không mặc nhiên là cookie đăng nhập website. File cookie giải mã được không chứng minh provider còn chấp nhận phiên đó.

### 5.2 Snapshot phải giữ ngữ nghĩa

Bài học từ B02–B04 là cần adapter có schema/capability rõ, thay vì coi header cookie là format trao đổi chung. Các thuộc tính quan trọng đã gặp: origin/domain, host-only, path, Secure, HttpOnly, SameSite, session/expiry, first-party/partition metadata và coverage bị bỏ qua/không quan sát được.

Expiry tương đối phải có mốc capture rõ; không khởi tạo lại Max-Age khi restore theo cách vô tình kéo dài tuổi phiên. Không merge các record bằng name đơn lẻ: cùng tên có thể thuộc domain/path/partition khác nhau.

JavaScript `document.cookie` không đủ cho HttpOnly hoặc full native metadata. Chuyển dữ liệu đọc được từ DOM không tương đương dump profile. Storage trong phép thử chỉ là localStorage/sessionStorage của origin YouTube đang mở; không bao gồm toàn bộ IndexedDB, cache, service worker state, mật khẩu, khóa gắn thiết bị hoặc DRM.

Đã chuyển cookie và storage cùng nhau nên chưa biết tập tối thiểu cần cho login. Cần thử cookies-only/storage-only trên profile thử riêng trước khi tối ưu capture.

### 5.3 Mã hóa đã thử và phần E2EE chưa có

- Lab WebView dùng AES-256-GCM, khóa ngẫu nhiên 32 byte, nonce 12 byte; AAD `aiohub-youtube-session:v1`.
- Lab Gecko dùng AES-256-GCM; AAD `aiohub-gecko-session:v1`, tag 128 bit theo thiết kế đã ghi nhận.
- Khóa tách khỏi encrypted envelope. Lab WebView có test giải mã chéo bằng Node AES-GCM và test sai khóa/tamper; lab Gecko có bộ JVM/Node kiểm thử riêng.
- Hai format/AAD là hai giao thức lab khác nhau; không coi là tương thích tự động.

Mã hóa file ở local là bằng chứng cho snapshot encryption. Nó chưa cung cấp identity của máy nhận, chống backend thay public key, chống replay, recovery, quyền thêm thiết bị hoặc E2EE qua cloud.

Đề xuất sản phẩm: thiết bị mới được thiết bị tin cậy duyệt; ràng buộc đúng recipient và provider scope; dùng giao thức/thư viện đã được đánh giá; server chỉ định tuyến/lưu ciphertext theo TTL. Không coi mật khẩu/token AIOHub đơn lẻ là bằng chứng đủ để thiết bị mới nhận mọi phiên Google. Cơ chế recovery khi mất toàn bộ thiết bị là quyết định còn mở.

Clipboard và file picker giúp kiểm thử thủ công, chưa phải UX key delivery của sản phẩm. Không đưa plaintext cookie/key vào React state toàn cục, log, analytics, crash report hoặc bản backup không được thiết kế cho việc đó. Cookie Google có thể cấp quyền rộng hơn YouTube; consent cần phản ánh phạm vi này.

### 5.4 Import cần recovery và xác minh provider

Prototype WebView cũ validate trước clear; nếu native restore từ chối một phần thì dọn phần mới nhập, nhưng không phục hồi được phiên cũ đã xóa. Lab Gecko sau có backup/rollback cookie trong RAM. Hai cách này có mức bảo vệ khác nhau.

Rollback trong RAM không bảo đảm an toàn khi process chết hoặc nguồn điện mất; cookie và web storage cũng chưa là một transaction nguyên tử. Khi làm app phải lựa chọn/kiểm thử candidate profile, journal hoặc cơ chế recovery phù hợp capability thực tế; không chỉ thêm một boolean `importSuccess`.

Các bước trạng thái đề xuất: nhận file → validate identity/schema/engine/TTL → giải mã/xác thực → chuẩn bị recovery → restore cookie → readback → restore storage đúng origin và đợi ack → reload → verify provider/account → công bố kết quả.

Nếu cookie import xong nhưng trang yêu cầu đăng nhập, kết quả phải là `reauth_required` hoặc lỗi verification, không phải “đã đồng bộ”. Provider từ chối phiên trên thiết bị/IP mới là kết quả cần hỗ trợ, không phải luôn có thể sửa ở phía app.

### 5.5 Không dùng last-write-wins cho phiên opaque

Chưa thử token rotation, hai thiết bị dùng đồng thời, nhiều ngày hoặc snapshot đến muộn. Merge/ghi đè cookie từ bản cũ có thể phá phiên mới. Nên tách sync bookmark/preferences của AIOHub khỏi transfer credential; chưa bật đồng bộ nền hai chiều chỉ dựa trên prototype file thủ công.

Logout AIOHub, xóa phiên local, chặn nhận transfer mới và revoke phiên ở provider là các thao tác khác nhau. Xóa ciphertext không thu hồi bản session đã giải mã trên máy khác.

## 6. Bài học UX: nội dung lớn, ít chuyển app, game và quảng cáo

- UI lab phục vụ quan sát/export/import, không nên bê nguyên toolbar/debug control vào sản phẩm. Mục tiêu là browser chiếm phần lớn màn hình, điều hướng nhỏ gọn nhưng luôn có đường Back/Exit và trạng thái lỗi rõ.
- Cần kiểm thử safe area, keyboard, orientation, system Back và video/game fullscreen trên native view thực. Hide chrome chỉ khi fullscreen hợp lệ và phải khôi phục UI khi thoát.
- Native lab từng có xử lý intent/YouTube scheme và immersive UI; scaffold React Native chưa port toàn bộ. Không đồng nhất việc bỏ thanh công cụ với việc chặn được mọi lời mời “Open in app”.
- Không có bằng chứng user-agent spoof, CSS/DOM intervention hoặc chặn app intent đã loại hết prompt YouTube trên mọi trang/version. Nếu áp dụng can thiệp website sau này, phải có fallback và test theo provider; không xóa consent/login UI để làm trang trông liền mạch.
- Catalog/game có thể gồm consent, age gate, pre-roll, banner và nút Play nhiều lần. Cần phân biệt app loading với trang đang đợi tương tác; không dùng spinner chung vô hạn.
- Adblock mới được bàn, chưa triển khai. [Gecko ETP](https://mozilla.github.io/geckoview/javadoc/mozilla-central/org/mozilla/geckoview/ContentBlocking.EtpLevel.html) là tracking protection; không phải bảo đảm chặn mọi quảng cáo. Strict có thể làm hỏng website.
- Nếu thử adblock: so sánh bật/tắt theo site, startup/restart, rewarded-ad và nút tiếp tục game. Không dùng nó để chữa crash emulator. Nội dung game không quảng cáo theo tuyến cung cấp phù hợp là phương án cần đánh giá riêng.
- Chưa triển khai foreground media service/lock-screen controls hay kiểm thử screen-off. Không hứa “free background music” từ việc phát được video ở foreground. Background, DRM, loại account và quyền media là các ca riêng.

## 7. Cách debug hiệu quả rút ra từ các ca trên

### 7.1 Tách các tầng trước khi sửa

| Tầng | Bằng chứng cần tìm |
| --- | --- |
| React Native / Codegen | Typecheck, JS bundle, native view registration, compile/link. |
| Native app | Exception/ANR của đúng package, view/session lifecycle, bridge request/ack. |
| Browser engine / provider | Main-frame navigation, allow/deny, window event, load error, cookie restore kết quả đã biên tập. |
| Game/website wrapper | Launcher/consent/ad/iframe/canvas/input đang ở bước nào. |
| Android Emulator host | Process còn sống không, exit code, watchdog, macOS `.ips`, gfxstream stack. |
| Studio / UI automation | Modal, cửa sổ đang active, scale tọa độ, tab/AVD đúng và ảnh có mới không. |

Lỗi unresolved Kotlin sau metadata mismatch không phải lỗi business logic; exit 139 không mặc nhiên là Gecko crash; trắng sau ad không mặc nhiên là Canvas/WebGL hỏng.

### 7.2 Trace hữu ích mà không lộ phiên

Ghi event type, sequence/thời gian tương đối, main-frame khi có, scheme/host, nhóm path đã chuẩn hóa, state load, allow/deny và mã lỗi cố định. Với restore ghi count và nhóm lỗi, không ghi full cookie name/value hoặc payload.

Không log query/fragment của URL auth, request headers, OAuth code, cookie, storage value, transfer key hay nội dung native messaging. Crash receipt chỉ giữ metadata/stack cần thiết; không đóng gói memory dump của process đăng nhập.

Mỗi lần thử nên gắn engine version, app version, OS/system image, emulator runtime, nguồn/đích, baseline có sạch không và thay đổi đúng một yếu tố. Giữ riêng kết quả cookies restored, provider authenticated, playback và persistence.

### 7.3 Những cách thử đã hữu ích

- Tạo máy đích sạch thật và quan sát signed-out trước import, thay vì chỉ tin app báo đã Clear.
- Dùng synthetic cookies/self-test để chứng minh API quyền/metadata trước khi thao tác phiên tài khoản thật.
- Test sai khóa/file lỗi trước mutation; test một record bị native từ chối và đường recovery.
- Có red/green regression cho lỗi chuẩn hóa host-only và URL của cookie API.
- Đối chiếu source Chromium đúng engine version khi giải thích metadata; không dựa vào branch main để mô tả byte-for-byte một version cũ.
- Thử runtime emulator khác trong thư mục cô lập, giữ app/profile/engine, rồi so sánh; không wipe userdata để làm biến mất lỗi.
- Sau thử nghiệm dọn ciphertext/key clipboard và process do mình khởi động; giữ profile khi người dùng còn cần. Không dừng emulator của người dùng chỉ để đổi cấu hình thử.

## 8. Những việc cần chứng minh trước khi gọi tính năng hoàn chỉnh

Đây là đề xuất kiểm chứng từ các khoảng trống đã thấy, không phải kế hoạch triển khai tự động hoặc feature đã hứa.

| Nhóm | Tình huống cần thử | Kết quả chấp nhận được |
| --- | --- | --- |
| Fresh login | MFA approve/cancel/timeout, remembered account, Back, popup, host Google theo quốc gia | Về đúng provider hoặc hiển thị trạng thái chờ/hủy/lỗi/đăng nhập lại rõ; không treo vô hạn. |
| Same-engine transfer | Hai điện thoại Android thật, đích sạch, nhiều vòng lặp | Đúng account, tác vụ có xác thực thành công; không chỉ dựa vào cookie count/avatar cache. |
| Network/device risk | Khác Wi-Fi/mobile network, OS/engine trong tập hỗ trợ | Hoạt động hoặc `reauth_required` rõ; không báo success giả. |
| Metadata | Host-only/domain/path, prefix, expiry/session, SameSite, partition | Giữ đúng scope; reject metadata không hiểu; không nâng quyền bằng cách bỏ cờ. |
| Failure recovery | Sai key, tamper, quá cỡ, partial native reject, storage error, process chết giữa restore | Không mất phiên không liên quan; không báo authenticated khi chưa verify; có đường recovery được thử. |
| Ownership | Đổi tài khoản AIOHub, đổi provider group, logout, Clear | Không đọc/export phiên của chủ trước và không clear nhầm nhóm khác. |
| Trust / delivery | Máy nhận chưa duyệt, thay recipient key, replay, hết TTL, snapshot cũ đến muộn | Chặn trước mutation và không ghi đè phiên mới. |
| Lifecycle | App relaunch, device reboot, restore snapshot emulator, reinstall, backup | Có kết quả riêng; không gộp các sự kiện này thành “persist tốt”. |
| Long-lived session | Rotation/expiry, hai máy dùng đồng thời, nhiều ngày, revoke provider | Theo dõi đúng trạng thái và fallback; không vòng lặp sync phá phiên. |
| Browser UX | System Back, keyboard, fullscreen/orientation, new window, external-app intent | Luồng rõ, không mất lối thoát; nội dung tận dụng màn hình. |
| Games | Catalog và direct game, consent/ad, input, restart, fullscreen, optional blocker bật/tắt | Vào gameplay và tương tác được; không lấy splash làm pass. |
| Media | Spotify/SoundCloud/YouTube theo loại account, DRM, screen-off/background, notification | Capability riêng có bằng chứng; không gắn nhãn hỗ trợ chung chỉ vì homepage tải được. |
| Performance | Cold start, download/install/cache, RAM/data/pin, nhiều session | Đo máy thật theo budget được chốt; chưa có budget hay số liệu đủ ở các prototype này. |
| iOS / cross-engine | WKWebView native từ source cuối, Gecko 159 → 160, Gecko ↔ WKWebView/Chromium nếu cần | Mỗi tuyến có adapter/capability/test riêng; mặc định chưa xác nhận hỗ trợ. |

## 9. Quyết định đã có và điều chưa nên tự suy

**Đã có trong trao đổi:** React Native làm shell; Android dùng GeckoView; ưu tiên thử YouTube; prototype trước rồi public; muốn encrypted session transfer; browser mở HTTP/HTTPS mọi host mặc định; muốn nội dung chiếm màn hình và ít chuyển app.

**Phê duyệt test cũ chỉ áp dụng phép thử local đã nêu.** Không coi đó là cho phép tự upload cookie/cloud, mở rộng provider scope hay tự gửi phiên tới thiết bị mới trong sản phẩm.

**Còn phải quyết định:** profile ownership/isolation, restore incomplete có được phép trong sản phẩm không, device trust/pairing, recovery khi mất thiết bị, TTL/retention, tuyến iOS/cross-engine, provider capability và background media được hỗ trợ. Adblock chưa là quyết định triển khai.

`ui-prototype/` có các mô phỏng tài khoản/player/device restore. Kế hoạch port UI không phải bằng chứng session backend hoặc provider auth đã hoàn thành. Dữ liệu demo bằng AsyncStorage không phải kho credential cho production; không lấy thuật toán account demo làm thiết kế auth AIOHub thật.

## 10. Tra cứu source và hồ sơ lịch sử

### 10.1 Bằng chứng đã đưa vào dự án

- [Verification WebView 05/11](experiment-evidence/webview-verification-2026-11-05.json).
- [Kết quả quan sát WebView 05/11](experiment-evidence/webview-results-2026-11-05.txt).
- [Xuất xứ/checksum và giới hạn truy xuất](experiment-evidence/source-provenance.json).
- [README app hiện tại](../README.md) là điểm bắt đầu cho setup; [package.json](../package.json), [package-lock.json](../package-lock.json), [root Gradle](../android/build.gradle) và [app Gradle](../android/app/build.gradle) sở hữu phiên bản executable.

### 10.2 Lab WebView còn truy cập được trên Mac tại lúc tổng hợp

Thư mục lịch sử: `/Users/nangsontay/Documents/Codex/2026-11-04/make-webview-behavior-like-browser/`.

- `plans/reports/technical-261105-1951-aiohub-prototype-ios-android.md`: báo cáo chi tiết hai đợt đầu; chứa rationale, trace nguồn và giới hạn.
- `outputs/youtube-session-lab/src/session-transfer.ts`: schema, validator, AES-GCM và `restoreAndroidHostOnlyCookies`.
- `outputs/youtube-session-lab/src/session-transfer.test.ts`: regression của codec/normalizer.
- `outputs/youtube-session-lab/modules/session-cookies/`: module Swift/Kotlin; xem phạm vi Clear trước khi tái sử dụng.
- `outputs/youtube-session-lab-source.zip`, `youtube-session-lab-android.apk`, `YouTubeSessionLab-simulator.zip`: artifact lịch sử, không thay thế bản release của app mới.

Các locator này thuộc máy phát triển, không được giả định còn đúng trên máy khác. Metadata bằng chứng đã sao chép giúp đọc kết quả mà không cần profile tài khoản. Không đóng gói account data hoặc transfer key để làm tài liệu tái lập.

### 10.3 GeckoView: locator lịch sử cần khôi phục/định vị lại

Các tên sau được ghi trong lịch sử làm việc; chưa truy xuất lại được ở vị trí cũ trong lần tổng hợp này. Chúng là locator để tìm lại artifact, **không phải link hứa chắc tồn tại trong repo hiện tại**:

- `MobileAssignment1/docs/geckoview-session-prototype.md`.
- `MobileAssignment1/prototypes/geckoview-lab/`: `MainActivity`, `NavigationPolicy`, `NavigationTrace`, `SessionCipher`, built-in `session-extension` và test JVM/Node.
- `plans/reports/debug-261107-1702-cookie-restore.md` và plan cookie-restore tương ứng.
- `plans/reports/test-261108-0145-geckoview-games.md`: quan sát đầu còn thất bại; phải đọc cùng kết quả debug sau, không dùng riêng làm kết luận hiện tại.
- `plans/reports/debug-261108-1011-geckoview-game-loading.md` và thư mục evidence `geckoview-game-debug-261108-1011/`: crash summaries, screenshots, verification, patch diagnostic và patch startup URL.
- `outputs/aiohub-geckoview-lab-source.zip`, APK lab YouTube và `aiohub-geckoview-html5games-android.apk`; các manifest build/verification tương ứng.

Khi tìm lại source, ưu tiên đối chiếu version và artifact manifest trước khi port. Không tái dựng một ZIP rồi gọi nó là bản đã thử nếu chưa xác minh được nguồn gốc. Lần tổng hợp này không chạy lại login, không đọc lại session đang đăng nhập và không thực hiện thêm transfer.

### 10.4 Tài liệu upstream để đối chiếu lại khi triển khai

- [React Native: Fabric Native Components](https://reactnative.dev/docs/fabric-native-components-introduction).
- [GeckoView project/API](https://mozilla.github.io/geckoview/). Javadoc nhánh central có thể mới hơn engine đã pin; đối chiếu version trước khi dùng API.
- [CookieManagerCompat](https://developer.android.com/reference/androidx/webkit/CookieManagerCompat).
- [Android build SDK/minor API](https://developer.android.com/build).
- [Chromium: pin emulator 37.1.11 do GL cleanup regression](https://chromium.googlesource.com/chromium/src/tools/android/+/0d2c7590ad90c5e3e5390a1d732ef2b2305d343d).

Khi có thử nghiệm mới, ghi app/engine/device, baseline, thay đổi, quan sát, outcome và giới hạn riêng. Chỉ nâng một nhận định “chưa kết luận” thành “đã sửa” khi có bằng chứng tái hiện và kiểm chứng tương ứng; không xóa các giới hạn cũ bằng một thông báo import thành công.
