// Sherlock Yes/No - Lateral Thinking Bulmaca Veritabanı
const STORIES = [
  {
    id: "adam-ve-asansor",
    title: "Adam ve Asansör",
    scenario: "Bir adam, bir binanın 15. katında yaşıyor. Her sabah asansöre biner, zemin kata iner ve işe gider. Akşam döndüğünde ise asansöre biner, 7. kata çıkar ve kalan 8 katı yürüyerek çıkar. Yağmurlu günlerde ise doğrudan 15. kata çıkar. Neden?",
    solution: "Adam çok kısadır. Asansör düğmelerinde sadece 7. kata kadar uzanabilir. Yağmurlu günlerde şemsiyesi olur ve şemsiyesiyle 15. kat düğmesine basabilir.",
    difficulty: 2,
    hints: [
      "Görünüşte mantıksız gelen bu davranış, adamın bir fiziksel özelliğinden kaynaklanıyor."
    ]
  },
  {
    id: "olum-tarlasi",
    title: "Tarladaki Adam",
    scenario: "Bir adam bir tarlada ölü bulunur. Etrafta başka kimse ve hiçbir ayak izi yoktur. Adam nasıl öldü?",
    solution: "Adam paraşütle atlıyordu ama paraşütü açılmadı. Sırt çantasındaki paraşüt açılmayınca tarlaya çakıldı.",
    difficulty: 1,
    hints: [
      "Adam ekstremsporları seviyordu."
    ]
  },
  {
    id: "restoran-silah",
    title: "Restoran ve Silah",
    scenario: "Bir kadın bir restorana girer ve garsondan bir bardak su ister. Garson kadına bir silah doğrultur. Kadın teşekkür eder ve restorandan çıkar. Ne oldu?",
    solution: "Kadının hıçkırığı vardı. Su istedi ama garson onu korkutarak hıçkırığını geçirmek istedi. Kadın hıçkırığı geçtiği için teşekkür etti.",
    difficulty: 2,
    hints: [
      "Garsonun sert tepkisi aslında garip bir tedavi yöntemiydi."
    ]
  },
  {
    id: "muzik-intihar",
    title: "Müzik ve Ölüm",
    scenario: "Bir adam arabasında giderken radyoyu açar, birkaç saniye dinler ve ardından kendini vurarak intihar eder. Neden?",
    solution: "Adam bir radyo DJ'idir. Karısını öldürmek için kusursuz bir cinayet planlar. Radyoya kesintisiz çalacak bir plak koyup stüdyodan gizlice çıkar, eve gidip karısını öldürür. Cinayet saatinde radyoda yayında olduğu için polise sunacağı mükemmel bir mazereti vardır. Ancak stüdyoya geri dönerken arabasında radyoyu açar ve plağın takıldığını duyar. Mazeretinin çöktüğünü ve cinayetten tutuklanacağını anlayan adam çaresizlikle intihar eder.",
    difficulty: 3,
    hints: [
      "Radyoda duyduğu detay, mükemmel sandığı planının suya düştüğünün kanıtıydı."
    ]
  },
  {
    id: "kral-zehir",
    title: "Kralın Şarabı",
    scenario: "Bir kral düşmanından bir şişe şarap hediye alır. Şarabın zehirli olup olmadığını anlamak ister. Hapiste idam cezası bekleyen mahkumları kullanmaya karar verir. Tam olarak hangi şişenin zehirli olduğunu bulmak için 10 şişe şarabı ve 4 mahkumu kullanabilir. Ertesi gün büyük bir ziyafet verecektir. Zehir 24 saat içinde etki eder. Kral bunu nasıl başarır?",
    solution: "İkili (binary) sistem kullanır. 4 mahkumla 2^4 = 16 farklı kombinasyon test edilebilir. Her şişeye 1-10 arası numara verilir ve ikilik sistemde yazılır. Her mahkum bir bit'i temsil eder. Mahkum o şişenin ikilik gösteriminde kendi bit'i 1 olan şişeleri içer. Ertesi gün ölen mahkumlara bakarak zehirli şişe bulunur.",
    difficulty: 3,
    hints: [
      "Kralın çözümü basit bir deneme yanılma değil, matematiksel bir dizilime dayanıyor."
    ]
  },
  {
    id: "pencere-atlayan",
    title: "Pencereden Atlayan Adam",
    scenario: "Bir adam 50 katlı bir binanın penceresinden atlar ama çizik bile almadan kurtulur. Nasıl?",
    solution: "Adam zemin kattan atlamıştır. 50 katlı bir binanın penceresi demek illa yüksek kat demek değil!",
    difficulty: 1,
    hints: [
      "Bu adam bunu korkmadan ve normal bir şeymiş gibi yaptı."
    ]
  },
  {
    id: "colgede-adam",
    title: "Çölde Bulunan Adam",
    scenario: "Çölün ortasında ölü bir adam bulunur. Elinde yarısı kırık bir kibrit var. Etrafta hiçbir iz yok. Adam nasıl öldü?",
    solution: "Adam ve birkaç kişi sıcak hava balonuyla uçuyorlardı. Balon düşmeye başladı ve yükü hafifletmek için eşyaları attılar. Yetmedi, kura çektiler - en kısa çöpü (kırık kibriti) çeken adam balondan atlayacaktı. Adam kısa kibriti çekti ve atladı.",
    difficulty: 2,
    hints: [
      "Elindeki nesne, şanssız sonuçlanan bir kumarın kanıtıdır."
    ]
  },
  {
    id: "ikizler",
    title: "İkizler ve Doğum Günü",
    scenario: "İki kız kardeş aynı yıl, aynı ay, aynı gün, aynı saatte, aynı anne ve babadan doğmuşlardır. Ama ikiz değillerdir. Bu nasıl mümkün?",
    solution: "Üçüz kardeştirler. İkiz olmamak, ikiden fazla kardeş olabilecekleri anlamına gelir.",
    difficulty: 1,
    hints: [
      "Kalabalık bir ailelerdi."
    ]
  },
  {
    id: "yemek-olum",
    title: "Martı Eti",
    scenario: "Bir adam bir restoranda martı eti sipariş eder. Bir çatal alır, hesabı öder, kapıdan çıkıp intihar eder. Neden?",
    solution: "Adam daha önce bir uçak kazası geçirmiş ve bir adada mahsur kalmıştı. Yardım gelene kadar bir şeyler yemek zorundalardı. Kazada o kör olmuştu, karısı da hayatını kaybetmişti. Ona yediği şeyin o an adada uçan martılar olduğunu söyleyerek karısının cansız bedenini yedirdiler. Adam hayatta kaldı. Yıllar sonra gerçek martı etini tattığında, adada yediği şeyin karısı olduğunu anladı.",
    difficulty: 3,
    hints: [
      "Adamın tattığı bu yeni lezzet, onu geçmişindeki acı bir yalanla yüzleştirdi."
    ]
  },
  {
    id: "kapali-oda-buz",
    title: "Kapalı Odadaki Ceset",
    scenario: "İçeriden kilitli bir odada bir adam asılmış halde bulunur. Odada sadece bir su birikintisi var. Odada başka ne mobilya ne de bir nesne var. Kendini nasıl astı?",
    solution: "Adam büyük bir buz bloğunun üzerine çıktı, ipi bağladı ve boynuna geçirdi. Buz eriyince asılı kaldı. Su birikintisi erimiş buzdan kalmıştır.",
    difficulty: 2,
    hints: [
      "Odada hedefe ulaşmasını sağlayan bir basamak vardı, ancak zamanla form değiştirdi."
    ]
  },
  {
    id: "telefon-cinayet",
    title: "Telefon Görüşmesi",
    scenario: "Bir adam karısını telefonla arar. Adam hattın diğer ucunda bir erkek sesi duyar ve hemen telefonu kapatır. Adam gülümser. Neden?",
    solution: "Adam yanlış numara çevirmiştir. Telefonu açan kişi karısı değil, yanlış numara çevirdiği bir yabancıdır. Erkek sesi duyunca yanlış numara çevirdiğini anladı ve kendi hatasına güldü.",
    difficulty: 1,
    hints: [
      "Duyduğu ses bir tehlike ya da ihanetin değil, masum bir hatanın sonucuydu."
    ]
  },
  {
    id: "kargo-ucak",
    title: "Kargo Uçağı",
    scenario: "Bir pilot tek motorlu bir kargo uçağıyla Sahra Çölü üzerinde uçarken motor arıza yapar. Pilot paraşütle atlar. Ertesi gün uçağın enkazı bulunur ama uçağın düştüğü yerde 20 ceset vardır. Pilot tek başına uçuyordu. Cesetler nereden geldi?",
    solution: "Uçak bir kargo uçağıydı ve dondurulmuş insan cesetleri taşıyordu. Uçaklar bazen cenaze nakli yapar. Uçak düşünce kargosu olan cesetler de ortaya saçıldı.",
    difficulty: 1,
    hints: [
      "Bulunan bedenler uçağın düşmesinin kurbanları değildiler."
    ]
  },
  {
    id: "kum-saati",
    title: "Köprüdeki Adam",
    scenario: "Bir adam 1 km uzunluğundaki bir köprüyü geçmek zorundadır. Köprünün her iki ucunda da nöbetçiler vardır. Nöbetçiler her 5 dakikada bir dışarı bakıyor. Köprüyü geçmek 8 dakika sürüyor. Adam yakalanmadan nasıl geçer?",
    solution: "Adam köprüye girer, 4.5 dakika yürür ve sonra arkasını döner, sanki karşı taraftan geliyormuş gibi yapar. Nöbetçi onu görünce geri gönderir - yani aslında karşıya geçmiş olur!",
    difficulty: 2,
    hints: [
      "Adam geçişi tamamlamak için nöbetçilerin reflekslerini kurnazca kullanıyor."
    ]
  }
];

export { STORIES };
