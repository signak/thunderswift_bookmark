# Thunderswift Bookmark - Chrome 拡張機能

[![GitHub ライセンス](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/signak/thunderswift_bookmark/main/LICENSE)
<!-- TODO: Add Web store URL -->
<!-- [![Chrome ウェブストアのバージョン](https://img.shields.io/chrome-web-store/v/oenllhgkiiljibhfagbfogdbchhdchml.svg)](https://chrome.google.com/webstore/detail/...) -->
<!-- [![Chrome ウェブストアのダウンロード数](https://img.shields.io/chrome-web-store/d/oenllhgkiiljibhfagbfogdbchhdchml.svg)](https://chrome.google.com/webstore/detail/...) -->

<!-- TODO: Add Screenshot -->

ショートカットキーにより素早く簡単にURLの保存と呼び出しを行うための拡張機能です。

## Language

- 日本語 (このページ)
- [English](https://raw.githubusercontent.com/signak/thunderswift_bookmark/main/readme.ja.md)

## 機能

| 機能       | 概要 |
| ---        | --- |
| URL保存    | 'Shift' + 割り当てたキーの押下で表示中のURLを保存（拡張機能のアイコンクリックでも可能） |
| URL呼出    | 割り当てたキーの押下で保存したURLの呼び出し |
| キー変更   | 割り当てキーの変更（オプション） |
| URL履歴    | 保存したURLの履歴（オプション） |
| フィルター | この拡張を有効にするサイトのURL設定（オプション） |

### フィルター機能に関する補足

フィルターは1つのURLしか設定できませんが、これ以上高機能化するつもりは今のところありません。
要望が多ければ改修を考えるつもりではあるものの、この拡張自体がかなり特殊な需要を満たす物であるため必要性も低そうなので。

## 権限

- activeTab: アクティブタブに表示されているサイトのURL取得と、アクティブタブへ任意のURLの読み込みを行います。
- storage: 各種設定およびURLをローカルストレージに保存します。

## インストール

<!-- TODO: 登録したらウェブストアのURL -->
- 推奨： [chrome ウェブストア](https://chrome.google.com/webstore/category/extensions) からのインストール
- もし手動でインストールする場合は package/thunderswift_bookmark をダウンロードし、任意の場所に配置して利用してください。

## ライセンス

[MIT ライセンス](https://raw.githubusercontent.com/signak/thunderswift_bookmark/main/LICENSE)
[邦訳](https://raw.githubusercontent.com/signak/thunderswift_bookmark/main/LICENSE.ja)
