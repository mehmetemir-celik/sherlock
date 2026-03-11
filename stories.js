// Sherlock Yes/No - Lateral Thinking Bulmaca Veritabanı
const STORIES = [
  {
    id: "adam-ve-asansor",
    title: "Adam ve Asansör",
    scenario: "Bir adam 20 katlı bir binanın 15. katında yaşıyor. Her sabah asansöre biner, zemin kata iner ve işe gider. Akşam döndüğünde ise asansöre biner, 7. kata çıkar ve kalan 8 katı yürüyerek çıkar. Yağmurlu günlerde ise doğrudan 15. kata çıkar. Neden?",
    solution: "Adam cüce boyludadır. Asansör düğmelerine sadece 7. kata kadar uzanabilir. Yağmurlu günlerde şemsiyesi olur ve şemsiyesiyle 15. kat düğmesine basabilir.",
    difficulty: 1,
    hints: [
      "Adamın fiziksel bir özelliği bu duruma neden oluyor.",
      "Yağmurlu günlerde yanında fazladan bir eşya taşıyor.",
      "Asansör düğmeleriyle ilgili bir sorun var."
    ]
  },
  {
    id: "karanlık-oda",
    title: "Karanlık Oda",
    scenario: "Bir adam karanlık bir odaya girer. Elinde bir kibrit var, odada bir gaz lambası, bir mum ve bir şömine var. Önce hangisini yakar?",
    solution: "Önce kibriti yakar! Başka bir şeyi yakmak için önce kibriti yakmak gerekir.",
    difficulty: 1,
    hints: [
      "Sorunun cevabı çok basit, fazla düşünme.",
      "Herhangi bir şeyi yakmak için neye ihtiyacın var?",
      "Elindeki aletle başla."
    ]
  },
  {
    id: "olum-tarlasi",
    title: "Tarladaki Adam",
    scenario: "Bir adam çıplak bir tarlada ölü bulunur. Sırt çantası taşımaktadır. Etrafta başka kimse ve hiçbir ayak izi yoktur. Adam nasıl öldü?",
    solution: "Adam paraşütle atlıyordu ama paraşütü açılmadı. Sırt çantasındaki paraşüt açılmayınca tarlaya çakıldı.",
    difficulty: 1,
    hints: [
      "Sırt çantasının içinde ne olabilir?",
      "Adam tarlaya yürüyerek gelmedi.",
      "Yukarıdan aşağıya doğru düşün."
    ]
  },
  {
    id: "restoran-silah",
    title: "Restoran ve Silah",
    scenario: "Bir kadın bir restorana girer ve garsondan bir bardak su ister. Garson kadına bir silah doğrultur. Kadın teşekkür eder ve restorandan çıkar. Ne oldu?",
    solution: "Kadının hıçkırığı vardı. Su istedi ama garson onu korkutarak hıçkırığını geçirmek istedi. Kadın hıçkırığı geçtiği için teşekkür etti.",
    difficulty: 2,
    hints: [
      "Kadının suya ihtiyaç duymasının asıl sebebini düşün.",
      "Garson aslında kadına yardım etmeye çalışıyordu.",
      "Halk arasında 'ani korku' neyi geçirir?"
    ]
  },
  {
    id: "muzik-intihar",
    title: "Müzik ve Ölüm",
    scenario: "Bir adam arabasında radyo dinlerken aniden durur, eve gider ve intihar eder. Radyoda ne duydu?",
    solution: "Adam bir radyo DJ'iydi. Radyoda kendi programı yerine önceden kaydedilmiş bir programın yayınlandığını duydu. Bu da karısının evde yalnız olmadığını, radyo istasyonuna 'kocam evde değil' mesajı verdiğini anladı. Eve gittiğinde karısını başka biriyle yakaladı.",
    difficulty: 3,
    hints: [
      "Adam normalde o saatte başka bir yerde olmalıydı.",
      "Radyoda kendi sesini bekliyordu.",
      "Eve gittiğinde hoş olmayan bir sürprizle karşılaştı."
    ]
  },
  {
    id: "kral-zehir",
    title: "Kralın Şarabı",
    scenario: "Bir kral düşmanından bir şişe şarap hediye alır. Şarabın zehirli olup olmadığını anlamak ister. Hapiste idam cezası bekleyen mahkumları kullanmaya karar verir. Tam olarak hangi şişenin zehirli olduğunu bulmak için 10 şişe şarabı ve 4 mahkumu kullanabilir. Ertesi gün büyük bir ziyafet verecektir. Zehir 24 saat içinde etki eder. Kral bunu nasıl başarır?",
    solution: "İkili (binary) sistem kullanır. 4 mahkumla 2^4 = 16 farklı kombinasyon test edilebilir. Her şişeye 1-10 arası numara verilir ve ikilik sistemde yazılır. Her mahkum bir bit'i temsil eder. Mahkum o şişenin ikilik gösteriminde kendi bit'i 1 olan şişeleri içer. Ertesi gün ölen mahkumlara bakarak zehirli şişe bulunur.",
    difficulty: 3,
    hints: [
      "Her mahkum birden fazla şişeden tadabilir.",
      "4 mahkumla 2^4 = 16 kombinasyon test edilebilir.",
      "Bilgisayar bilimindeki bir sayı sistemi düşün."
    ]
  },
  {
    id: "pencere-atlayan",
    title: "Pencereden Atlayan Adam",
    scenario: "Bir adam 50 katlı bir binanın penceresinden atlar ama çizik bile almadan kurtulur. Nasıl?",
    solution: "Adam zemin kattan (1. kat) atlamıştır. 50 katlı bir binanın penceresi demek illa yüksek kat demek değil.",
    difficulty: 1,
    hints: [
      "50 katlı bina bilgisi seni yanıltmasın.",
      "Pencere hangi katta olabilir?",
      "En alt katı düşün."
    ]
  },
  {
    id: "colgede-adam",
    title: "Çölde Bulunan Adam",
    scenario: "Çölün ortasında ölü bir adam bulunur. Elinde yarısı kırık bir kibrit var. Etrafta hiçbir iz yok. Adam nasıl öldü?",
    solution: "Adam ve birkaç kişi sıcak hava balonuyla uçuyorlardı. Balon alçalmaya başladı ve yükü hafifletmek için eşyaları attılar. Yetmedi, kura çektiler - en kısa çöpü (kırık kibriti) çeken adam balondan atlayacaktı. Adam kısa kibriti çekti ve atladı.",
    difficulty: 2,
    hints: [
      "Adam çölde yürüyerek ölmedi, yukarıdan geldi.",
      "Kibriti neden kırdığını değil, kısa kibritin ne anlama geldiğini düşün.",
      "Birden fazla kişinin hayatını kurtarmak için birinin fedakarlık yapması gerekti."
    ]
  },
  {
    id: "ikizler",
    title: "İkizler ve Doğum Günü",
    scenario: "İki kız kardeş aynı yıl, aynı ay, aynı gün, aynı saatte, aynı anne ve babadan doğmuşlardır. Ama ikiz değillerdir. Bu nasıl mümkün?",
    solution: "Üçüz veya daha fazla kardeştirler (örneğin üçüz). İkiz olmamak, ikiden fazla kardeş olabilecekleri anlamına gelir.",
    difficulty: 1,
    hints: [
      "İkiz olmamak, iki kişi olmadıkları anlamına gelmez.",
      "Aynı anda kaç bebek doğabilir?",
      "İkizden sonra ne gelir?"
    ]
  },
  {
    id: "olu-otel",
    title: "Ölü Adam ve Otel",
    scenario: "Bir adam bir otele girer ve resepsiyondaki görevliye 'bir oda istiyorum' der. Görevli adama oda numarasını ve anahtarını verir. Adam odasına gider ve hemen kendini öldürür. Neden?",
    solution: "Adam yoğun bir gün geçirmiştir ve 'Bir oda istiyorum' dediğinde aslında 'bir oda istiyorum ki dinleneyim' demek istiyordu. Ama aslında bu hikayenin cevabı: Adam çok borçludur ve hayattan bezmiştir. Otele gitmesinin sebebi ailesinin onu bu halde görmesini istememesindendir.",
    difficulty: 2,
    hints: [
      "Adam bunu neden evinde yapmadı?",
      "Sevdiği insanlara karşı hissettiklerini düşün.",
      "Adam ailesi tarafından bu şekilde bulunmak istemiyordu."
    ]
  },
  {
    id: "yemek-olum",
    title: "Son Yemek",
    scenario: "Bir adam bir restoranda albatros çorbası sipariş eder. Bir kaşık alır, hesabı öder, eve gider ve intihar eder. Neden?",
    solution: "Adam daha önce bir gemi kazası geçirmiş ve bir adada mahsur kalmıştı. Açlıktan ölmek üzereyken yol arkadaşı ona 'albatros çorbası' olduğunu söyleyerek bir çorba verdi. Adam hayatta kaldı. Yıllar sonra gerçek albatros çorbası tattığında, adada yediği çorbanın farklı olduğunu anladı - arkadaşı ona aslında ölen diğer kazazedelerin etinden yapılmış çorba vermişti.",
    difficulty: 3,
    hints: [
      "Adamın geçmişinde travmatik bir olay var.",
      "Daha önce de 'albatros çorbası' yediğini düşünüyordu.",
      "Restoranda tattığı çorba, daha önce yediğinden çok farklıydı."
    ]
  },
  {
    id: "kapali-oda-buz",
    title: "Kapalı Odadaki Ceset",
    scenario: "İçeriden kilitli bir odada bir adam asılmış halde bulunur. Odada sadece bir su birikintisi var. Odada başka ne mobilya ne de bir nesne var. Kendini nasıl astı?",
    solution: "Adam büyük bir buz bloğunun üzerine çıktı, ipi bağladı ve boynuna geçirdi. Buz eriyince asılı kaldı. Su birikintisi erimiş buzdan kalmıştır.",
    difficulty: 2,
    hints: [
      "Su birikintisi en önemli ipucu.",
      "Odada şimdi olmayan ama daha önce olan bir nesne düşün.",
      "Bir madde üç halde bulunabilir: katı, sıvı, gaz..."
    ]
  },
  {
    id: "telefon-cinayet",
    title: "Telefon Görüşmesi",
    scenario: "Bir adam karısını telefonla arar. Karısı telefonu açar. Adam hattın diğer ucunda bir erkek sesi duyar ve hemen telefonu kapatır. Adam gülümser. Neden?",
    solution: "Adam yanlış numara çevirmiştir. Telefonu açan kişi karısı değil, yanlış numara çevirdiği bir yabancıdır. Erkek sesi duyunca yanlış numara çevirdiğini anladı ve kendi hatasına güldü.",
    difficulty: 2,
    hints: [
      "Adam karısından şüphelenmiyor.",
      "Gülmesinin sebebi zararsız bir hata.",
      "Gerçekten karısını mı aradı?"
    ]
  },
  {
    id: "kargo-ucak",
    title: "Kargo Uçağı",
    scenario: "Bir pilot tek motorlu bir kargo uçağıyla Sahra Çölü üzerinde uçarken motor arıza yapar. Pilot paraşütle atlar. Ertesi gün uçağın enkazı bulunur ama uçağın düştüğü yerde 20 ceset vardır. Pilot tek başına uçuyordu. Cesetler nereden geldi?",
    solution: "Uçak bir kargo uçağıydı ve dondurulmuş insan cesetleri taşıyordu. Uçaklar bazen cenaze nakli yapar. Uçak düşünce kargosu olan cesetler de ortaya saçıldı.",
    difficulty: 2,
    hints: [
      "Kargo uçağı ne tür kargo taşıyor olabilir?",
      "Cesetler uçak düşmeden önce zaten oradaydı.",
      "Uçak özel bir nakliye görevi yapıyordu."
    ]
  },
  {
    id: "kum-saati",
    title: "Köprüdeki Adam",
    scenario: "Bir adam 1 km uzunluğundaki bir köprüyü geçmek zorundadır. Köprünün her iki ucunda da nöbetçiler vardır. Nöbetçiler her 5 dakikada bir dışarı bakıyor. Köprüyü geçmek 8 dakika sürüyor. Adam yakalanmadan nasıl geçer?",
    solution: "Adam köprüye girer, 4.5 dakika yürür ve sonra arkasını döner, sanki karşı taraftan geliyormuş gibi yapar. Nöbetçi onu görünce geri gönderir - yani aslında karşıya geçmiş olur!",
    difficulty: 2,
    hints: [
      "8 dakikada geçemez ama 5. dakikada bir şey yapabilir.",
      "Nöbetçilerin onu görmesi kötü bir şey olmak zorunda değil.",
      "Nöbetçi seni karşı taraftan geliyor sanırsa ne yapar?"
    ]
  }
];

export { STORIES };
