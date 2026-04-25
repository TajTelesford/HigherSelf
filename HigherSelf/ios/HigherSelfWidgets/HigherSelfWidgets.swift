import SwiftUI
import WidgetKit

struct HigherSelfWidgetEntry: TimelineEntry {
  let date: Date
}

struct HigherSelfWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> HigherSelfWidgetEntry {
    HigherSelfWidgetEntry(date: Date())
  }

  func getSnapshot(in context: Context, completion: @escaping (HigherSelfWidgetEntry) -> Void) {
    completion(HigherSelfWidgetEntry(date: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<HigherSelfWidgetEntry>) -> Void) {
    let now = Date()
    let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: now) ?? now
    let timeline = Timeline(entries: [HigherSelfWidgetEntry(date: now)], policy: .after(nextRefresh))
    completion(timeline)
  }
}

struct HigherSelfWidgetView: View {
  let entry: HigherSelfWidgetEntry

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [
          Color(red: 18 / 255, green: 24 / 255, blue: 38 / 255),
          Color(red: 38 / 255, green: 47 / 255, blue: 73 / 255)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )

      VStack(alignment: .leading, spacing: 10) {
        Text("HIGHERSELF")
          .font(.system(size: 12, weight: .semibold, design: .rounded))
          .foregroundStyle(.white.opacity(0.72))

        Spacer()

        Text("Your widget is almost ready.")
          .font(.system(size: 19, weight: .bold, design: .rounded))
          .foregroundStyle(.white)

        Text("We’ll wire your in-app settings into this next.")
          .font(.system(size: 13, weight: .medium, design: .rounded))
          .foregroundStyle(.white.opacity(0.8))
      }
      .padding(18)
    }
  }
}

struct HigherSelfWidget: Widget {
  let kind = "HigherSelfWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: HigherSelfWidgetProvider()) { entry in
      HigherSelfWidgetView(entry: entry)
    }
    .configurationDisplayName("HigherSelf")
    .description("A daily reminder from HigherSelf on your Home Screen.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct HigherSelfWidgetsExtension: WidgetBundle {
  var body: some Widget {
    HigherSelfWidget()
  }
}
