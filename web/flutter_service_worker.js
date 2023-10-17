'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon-16x16.png": "a583cb7676f427307a645249418741e7",
"version.json": "5d462ce7573cf1306f9efd5b8152a0f4",
"splash/img/loader.png": "357e572903dc04627656fcb804bd7b86",
"splash/style.css": "c2c46d163abf96c7d2c55e7af1ba6a15",
"favicon.ico": "4846b535ad32c3b5360b508611f6b196",
"index.html": "5f598abb527cded274053c1671cf2201",
"/": "5f598abb527cded274053c1671cf2201",
"android-chrome-192x192.png": "d120719cb0653d549bffb3b5d482cb61",
"apple-touch-icon.png": "ff5f2039bccbc891463eb8dff9edb9f7",
"main.dart.js": "a5def99290c4ad19d41a2cd1841ac3c4",
"android-chrome-512x512.png": "b3d62d52f7f1883bb241d6a8bcdfa1d2",
"icons/Icon-192.png": "d120719cb0653d549bffb3b5d482cb61",
"icons/Icon-152.png": "b3d62d52f7f1883bb241d6a8bcdfa1d2",
"manifest.json": "f503c66689ba3293087b5f1c444404fe",
"assets/AssetManifest.json": "b69c792c81e8034e56b3188163ca3e82",
"assets/NOTICES": "8d40b5ea68856ed681b2758a74bf0031",
"assets/FontManifest.json": "a16c8179175c89109c1776810dc33b67",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/assets/images/logo_in_white.png": "7d8e8b9d84f43aceb8fc92bc40f57cef",
"assets/assets/images/icon_topics.png": "5f81070f770db9dec6ed6c64c199e07b",
"assets/assets/images/icon_training_calendar.png": "b95aefdb9c3e73486577a6c84eb93a2e",
"assets/assets/images/icon_loan.png": "df49077b843e1e7f50390adb1e1c3867",
"assets/assets/images/icon_megaphone.png": "ce4fa43bfb57d802452d2671aaf1668d",
"assets/assets/images/icon_mute.png": "863651e21243b759593ebef652c5442e",
"assets/assets/images/icon_chat_group.png": "d90eb2e13629f773d2d2664b8f9e8826",
"assets/assets/images/icon_product_energie.png": "e76b1f4e53e25ba88a14ba20b42342ea",
"assets/assets/images/icon_cashflow.png": "3a88637a586988954aa7865d6a2db290",
"assets/assets/images/icon_apk.png": "9c366117b19debe5d8141b157cbe81b1",
"assets/assets/images/password_fair.png": "4e8116ed39a8a55885ed194f903fd3ec",
"assets/assets/images/icon_invoice.png": "88ee6532dc48427678217426f1b85087",
"assets/assets/images/icon_shuffle.png": "df72bf22d8b8e823bb0dcf22d1c55295",
"assets/assets/images/icon_backup.png": "e9788f98bf03dcb1a48310d89be345ed",
"assets/assets/images/icon_target.png": "fcec96b8ab1397a776fd6d1df8abca6b",
"assets/assets/images/icon_pin_map.png": "bf8c3fbdbaf37c63dcc624d27db36369",
"assets/assets/images/icon_download.png": "a3919d8bd3cd50455222d01ce96bc87c",
"assets/assets/images/icon_projects.png": "4f7c6d071764f47935e28e48cde5f658",
"assets/assets/images/image_loader.gif": "ba59d81fb8c638432a84ef8e6ca00e41",
"assets/assets/images/icon_loan_stamp.png": "b72df5bbd4fe48abc69b274567785177",
"assets/assets/images/icon_access.png": "1be4486c5579a0bc99f44efe46d124a7",
"assets/assets/images/icon_partners.png": "d91822967b64e57c7887393239b324ea",
"assets/assets/images/icon_setting.png": "98c2a893324f4fa963c69f19b38f9867",
"assets/assets/images/icon_delivery.png": "22098524fcda9b57f4be853aecb3d476",
"assets/assets/images/icon_consolidate.png": "1ce486ed6affdf1149fd0a38dabe0950",
"assets/assets/images/icon_survey.png": "c64ab4e565a1793be2f6c7bfbb3cb699",
"assets/assets/images/bg_image.jpg": "16d95b89cababbe08a25165ce9080d95",
"assets/assets/images/icon_menu.png": "4c71d90f12424f1c348b5b72cfcee4ef",
"assets/assets/images/icon_employees.png": "c7a212091c88ddf76fe7be51400fe765",
"assets/assets/images/icon_users.png": "e115874d479d7657d8d1c1d0af7bd05a",
"assets/assets/images/icon_google_drive.png": "92ecff631f6b8bd81b4b4a07602d8baf",
"assets/assets/images/icon_stock_revendeur.png": "c0a252d2b5d79168282cdd8f65a9514b",
"assets/assets/images/lock_screen.png": "0e60ab5994359957eb00228e5ab9c1ca",
"assets/assets/images/icon_sync.png": "26c0fedbdaa12c84c114347ac900a1f2",
"assets/assets/images/icon_reporting.png": "bfb78edf7ce269f8e56efb9b87715e31",
"assets/assets/images/Icon_notification_active.png": "d031e440553e9bb2819b901d377ef268",
"assets/assets/images/icon_id_card.png": "438c8b76d843dfd955d4986f3ad39c5c",
"assets/assets/images/icon_password.png": "424e6ef6ba9e92abe056698a91f18dff",
"assets/assets/images/icon_calculator.png": "4a005c9b9013264a3e545d9ceaa91160",
"assets/assets/images/icon_chart.png": "db3bd4c479230e278eaaf7b010952038",
"assets/assets/images/icon_groups.png": "8b0dd6226930e845311ba07fe940c842",
"assets/assets/images/password_weak.png": "ad0e196257deede402c22eb68f782734",
"assets/assets/images/icon_reset.png": "cb507ed3cb1725a6aa390aec88f100ff",
"assets/assets/images/icon_map.png": "83ad9e6e8889257e4028f4957e70a583",
"assets/assets/images/icon_signature.png": "2f9bf0a8e455ddcf398e3614a6125477",
"assets/assets/images/icon_logs.png": "4199d697a6263f5f944ff732d5f52db7",
"assets/assets/images/avatar.png": "28475612ac78145226556b313c09b6f9",
"assets/assets/images/icon_cash_in.png": "1ec0484eebc1f099520c234b77958798",
"assets/assets/images/icon_secure_user.png": "c6c2453df115a49147e3c9327ae7b66a",
"assets/assets/images/icon_pay_calendar.png": "92738ed2402fc80bd2451b2be6a437d1",
"assets/assets/images/icon_binary_codes.png": "8aa11e29fa5fbfd4200595e794147d21",
"assets/assets/images/icon_money_transfer.png": "e3f5130fafaa08c70cb308b9764705c8",
"assets/assets/images/password_null.png": "7f894a7f222e8a1c5d4838f54e41a1f3",
"assets/assets/images/logo.png": "e93a3e4468051f73c5f5479dacae7495",
"assets/assets/images/icon_no_signal.png": "2d8693314dd008513ac745a3ef8da357",
"assets/assets/images/logo_white.png": "357e572903dc04627656fcb804bd7b86",
"assets/assets/images/icon_cash_flow.png": "6cdca1bc4fb99736901b44cf6874b8fe",
"assets/assets/images/icon_stock.png": "677edd04815f40564a8afdeffe9023fc",
"assets/assets/images/icon_folders.png": "b465836922d72655cf4e82cbd243a768",
"assets/assets/images/icon_inbox.png": "e1952f424b550b1a1556b919128f6336",
"assets/assets/images/icon_sensibilisation.png": "5661b0bf8ed534f0670b6e95edc1b600",
"assets/assets/images/icon_user.png": "ea02b0c0d64551cd1d3c476c2d13b413",
"assets/assets/images/icon_sms_questionnaires.png": "06f49a8b6ac6cb28f97a39c0b388323f",
"assets/assets/images/icon_meeting.png": "fffd405d6a604611f39792496234b76e",
"assets/assets/images/icon_cart_reseller.png": "62b49e1571903a5bb769d3af049ad9d0",
"assets/assets/images/icon_client.png": "bfab3cefb69f6330b52d6ac5e465f659",
"assets/assets/images/icon_home.png": "6e694be44c59c5dbc4e78ec12ca95fce",
"assets/assets/images/icon_report.png": "baca955c7435118530434adc3dbc353e",
"assets/assets/images/icon_product_list.png": "d3e99c0a8f63dbea653e2c540c6c2f58",
"assets/assets/images/icon_calendar.png": "0ce99602040c40f9027c7ad896cd0fd9",
"assets/assets/images/icon_education.png": "39ded04f6985e2d9720e7e6d7d8bf426",
"assets/assets/images/icon_office.png": "6d38d168527caff70ad3b2dbf6c715f9",
"assets/assets/images/icon_money_reload.png": "6444fe190598787d97114c4d8401284f",
"assets/assets/images/camera_avatar.png": "a7644478d9a6080c139fe138510e229b",
"assets/assets/images/icon_inspect.png": "d930c4a26481b794ade1e6707a9fcde2",
"assets/assets/images/icon_roles.png": "11c84c8e3d1754c90d8f64c758aaae9f",
"assets/assets/images/icon_products.png": "e778755d18d22280a6e55643133b1832",
"assets/assets/images/icon_store.png": "c9940c83e8340ff9a9701533d60aa01d",
"assets/assets/images/icon_training.png": "36f436867e04dd12b00a048f3235e388",
"assets/assets/images/icon_product_category.png": "84403e3c7b527bb3f0ddcf620585d913",
"assets/assets/images/icon_order.png": "ef0eb813709393db0c5837d7f577b396",
"assets/assets/images/icon_handshake.png": "124abd987c5db6654bbe793c90f817c6",
"assets/assets/images/icon_prospection.png": "52ef47e60b87899b0c2f8f396ff7b9d4",
"assets/assets/images/icon_chat_one_to_one.png": "cab5ec6c2dcee590ffefba0447fae1d8",
"assets/assets/images/icon_user_session.png": "4b4d22ff3e1410842c94a3ada985bec3",
"assets/assets/images/icon_notification.png": "73b013ba077fe75c63bd1a1c2669094d",
"assets/assets/images/whatsapp_chat_bg.png": "adbccee0708ae3b7a71d9652fb353299",
"assets/assets/images/icon_feedback.png": "af724942e75dd740123a222c41c7d824",
"assets/assets/images/icon_session.png": "b1ea6ae52aa1d0261cfebb7370a58e6f",
"assets/assets/images/bg.png": "978cc648c0801563853eb8db26e473e8",
"assets/assets/images/password_strong.png": "967b30ede6562b6422125658117ff528",
"assets/assets/logos/logo_ada.png": "d2e2ab3b6ed43f759c87b859508137b8",
"assets/assets/logos/logo_imf.png": "7aa2b183373e4c138096489e0d71f85d",
"assets/assets/message_iphone.mp3": "b903eeaab34cd95013ae79bbf273bb64",
"assets/assets/notification_1.mp3": "8d634db1a1472b14e9565a93c2b55cc6",
"assets/assets/notification_2.mp3": "d52c7c3bcbcc4aab951fc306fd7c8c30",
"assets/assets/notification_3.mp3": "2b389a74efea48c3c5e670706204b535",
"assets/assets/notification_6.mp3": "c95363a342c1b2abf325ae3e211bc7d8",
"assets/assets/notification_4.mp3": "92d83839aa201865770d8c35291c11e5",
"assets/assets/notification_5.mp3": "59d676069a2ce60cb62f0b1e15acf5cb",
"assets/assets/fonts/SF-Pro-Display-Light.otf": "ac5237052941a94686167d278e1c1c9d",
"assets/assets/fonts/SF-Pro-Display-Regular.otf": "aaeac71d99a345145a126a8c9dd2615f",
"assets/assets/fonts/Degular-Regular.otf": "44b58e802cfbbbc874fe0a4829489985",
"assets/assets/fonts/IBMPlexMono-Light.ttf": "73b54309d040298a9b15f95fa4fa8ecd",
"assets/assets/fonts/Aeonik.otf": "8b596560260fe8d7fbb96e368603800f",
"assets/assets/fonts/Aeonik-Regular.otf": "844324dc83d98980285a9ab8f3dcb5f0",
"assets/assets/fonts/MarkPro.ttf": "bc0a1340d494b5f00a16428bf006b9dc",
"assets/assets/fonts/SanFransisco.ttf": "874a5d08bae086b30f6f3180fadfd930",
"favicon-32x32.png": "543c563d1f325937533680d767c507cb"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
