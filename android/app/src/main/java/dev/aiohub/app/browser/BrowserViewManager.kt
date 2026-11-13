package dev.aiohub.app.browser

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.AIOBrowserManagerDelegate
import com.facebook.react.viewmanagers.AIOBrowserManagerInterface

@ReactModule(name = BrowserViewManager.NAME)
class BrowserViewManager : SimpleViewManager<BrowserView>(), AIOBrowserManagerInterface<BrowserView> {
  private val delegate = AIOBrowserManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<BrowserView> = delegate
  override fun getName() = NAME
  override fun createViewInstance(context: ThemedReactContext) = BrowserView(context)

  @ReactProp(name = "sourceUrl")
  override fun setSourceUrl(view: BrowserView, value: String?) = view.loadUrl(value)

  override fun onDropViewInstance(view: BrowserView) {
    view.dispose()
    super.onDropViewInstance(view)
  }

  companion object {
    const val NAME = "AIOBrowser"
  }
}
