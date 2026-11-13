package dev.aiohub.app.browser

import android.net.Uri
import com.facebook.react.uimanager.ThemedReactContext
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView

class BrowserView(context: ThemedReactContext) : GeckoView(context) {
  private val browserSession = GeckoSession()

  init {
    val runtime = sharedRuntime ?: GeckoRuntime.create(
      context.applicationContext,
      GeckoRuntimeSettings.Builder().remoteDebuggingEnabled(false).consoleOutput(false).build(),
    ).also { sharedRuntime = it }
    browserSession.open(runtime)
    setSession(browserSession)
  }

  fun loadUrl(url: String?) {
    val uri = url?.let(Uri::parse) ?: return
    // All web hosts and ports are accepted; this prop cannot open local or executable URIs.
    if ((uri.scheme == "https" || uri.scheme == "http") && !uri.host.isNullOrEmpty()) {
      browserSession.loadUri(url)
    }
  }

  fun dispose() {
    releaseSession()
    browserSession.close()
  }

  companion object {
    // Gecko supports one runtime per app process, shared by browser views.
    private var sharedRuntime: GeckoRuntime? = null
  }
}
